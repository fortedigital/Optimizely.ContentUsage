using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EPiServer.Data;
using EPiServer.ServiceLocation;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeUsagesRepository
{
    private readonly DatabaseDateTimeHandler _databaseDateTimeHandler;
    private readonly ServiceAccessor<IAsyncDatabaseExecutor> _dataExecutorAccessor;

    public ContentTypeUsagesRepository(ServiceAccessor<IAsyncDatabaseExecutor> dataExecutorAccessor,
        DatabaseDateTimeHandler databaseDateTimeHandler)
    {
        _dataExecutorAccessor = dataExecutorAccessor;
        _databaseDateTimeHandler = databaseDateTimeHandler;
    }

    public async Task<IEnumerable<ContentTypeUsageCounter>> ListContentTypesUsagesCounters(
        CancellationToken cancellationToken)
    {
        var executor = _dataExecutorAccessor();
        return await executor.ExecuteAsync((Func<Task<IEnumerable<ContentTypeUsageCounter>>>)(async () =>
        {
            var command1 = executor.CreateCommand();
            command1.CommandText = @"DECLARE @Results TABLE (
	ContentTypeId INT,
	Scope NVARCHAR(255)
)

DECLARE contentTypes CURSOR FOR
	SELECT CT.pkID AS ID
	FROM tblContentType CT
	LEFT JOIN tblContentTypeDefault AS CTD ON CTD.fkContentTypeID=CT.pkID 

DECLARE @ID INT

OPEN contentTypes
FETCH NEXT FROM contentTypes INTO @ID
WHILE @@FETCH_STATUS = 0
BEGIN
	INSERT INTO @Results (ContentTypeId, Scope) (SELECT @ID, ScopeName FROM dbo.GetScopedBlockProperties(@ID))
    FETCH NEXT
    FROM contentTypes INTO @ID
END

CLOSE contentTypes
DEALLOCATE contentTypes

SELECT 
	CASE WHEN ContentTypeUsageTable.ContentTypeId IS NULL THEN cT.ID ELSE ContentTypeUsageTable.ContentTypeId END as ContentTypeId, 
	CASE WHEN ContentTypeUsageTable.ContentTypeId IS NULL THEN 0 ELSE COUNT(*) END as Count  
FROM (SELECT 
			test.ContentTypeId,
			WorkContent.fkContentID as ContentID, 
			LanguageBranch.LanguageID AS LanguageBranch
		FROM tblWorkContentProperty as Property WITH(INDEX(IDX_tblWorkContentProperty_ScopeName))
		INNER JOIN @Results as test ON Property.ScopeName LIKE (test.Scope + '%')
		INNER JOIN tblWorkContent as WorkContent ON WorkContent.pkID = Property.fkWorkContentID
		INNER JOIN tblLanguageBranch as LanguageBranch ON LanguageBranch.pkID=WorkContent.fkLanguageBranchID
		LEFT OUTER JOIN (SELECT CT.pkID AS ID
	FROM tblContentType CT
	LEFT JOIN tblContentTypeDefault AS CTD ON CTD.fkContentTypeID=CT.pkID) as cT ON cT.ID = test.ContentTypeId
		GROUP BY test.ContentTypeId, WorkContent.fkContentID, LanguageBranch.LanguageID
UNION
SELECT
			tblPage.fkPageTypeID as ContentTypeID,
			tblPage.pkID as ContentID, 
			tblLanguageBranch.LanguageID AS LanguageBranch
		FROM 
			tblWorkPage
		INNER JOIN 
			tblPage ON tblWorkPage.fkPageID = tblPage.pkID
		INNER JOIN 
			tblPageLanguage ON tblWorkPage.fkPageID=tblPageLanguage.fkPageID 
		INNER JOIN
			tblLanguageBranch ON tblLanguageBranch.pkID=tblWorkPage.fkLanguageBranchID
		GROUP BY tblPage.fkPageTypeID, tblPage.pkID, tblLanguageBranch.LanguageID
) as ContentTypeUsageTable
RIGHT OUTER JOIN (SELECT CT.pkID AS ID
	FROM tblContentType CT
	LEFT JOIN tblContentTypeDefault AS CTD ON CTD.fkContentTypeID=CT.pkID) as cT ON cT.ID = ContentTypeUsageTable.ContentTypeId
GROUP BY cT.ID, ContentTypeUsageTable.ContentTypeId";

            var contentTypeUsageCounters = new List<ContentTypeUsageCounter>();
            await using var dbDataReader = await command1.ExecuteReaderAsync(cancellationToken);
            while (await dbDataReader.ReadAsync(cancellationToken))
            {
                var contentTypeUsageCounter = new ContentTypeUsageCounter
                {
                    ContentTypeId = (int)dbDataReader["ContentTypeId"],
                    Count = (int)dbDataReader["Count"]
                };

                contentTypeUsageCounters.Add(contentTypeUsageCounter);
            }

            return contentTypeUsageCounters;
        }));
    }

    /// <summary>
    ///     For each given block type, counts on how many published pages (grouped by page type) its published
    ///     instances are used, following soft links through nested blocks. Runs as a single round-trip for all
    ///     block types; the traversal is de-duplicated and stops on circular block references.
    /// </summary>
    public async Task<IEnumerable<BlockTypeUsageStatistic>> ListBlockTypesUsageStatistics(
        IReadOnlyCollection<int> blockTypeIds, CancellationToken cancellationToken)
    {
        if (blockTypeIds.Count == 0)
            return Array.Empty<BlockTypeUsageStatistic>();

        var executor = _dataExecutorAccessor();

        return await executor.ExecuteAsync((Func<Task<IEnumerable<BlockTypeUsageStatistic>>>)(async () =>
        {
            var command = executor.CreateCommand();

            var idParameterNames = new List<string>();
            var index = 0;
            foreach (var blockTypeId in blockTypeIds.Distinct())
            {
                var parameterName = $"BlockTypeId{index++}";
                idParameterNames.Add($"(@{parameterName})");
                command.Parameters.Add(executor.CreateParameter(parameterName, blockTypeId));
            }

            command.Parameters.Add(executor.CreateParameter("NowTime",
                _databaseDateTimeHandler.ConvertToDatabase(DateTime.Now)));

            command.CommandText = $@"
                SET NOCOUNT ON

                DECLARE @BlockTypeIds TABLE (ContentTypeID int PRIMARY KEY)
                INSERT @BlockTypeIds (ContentTypeID) VALUES {string.Join(", ", idParameterNames)}

                -- Published instances of every requested block type
                DECLARE @Usages TABLE (ContentID int, WorkID int, [Name] nvarchar(255), LanguageBranch nchar(17))
                DECLARE @Blocks TABLE (ContentTypeID int, ContentID int, PRIMARY KEY (ContentTypeID, ContentID))
                DECLARE @ContentTypeID int

                DECLARE blockTypes CURSOR LOCAL FAST_FORWARD FOR SELECT ContentTypeID FROM @BlockTypeIds
                OPEN blockTypes
                FETCH NEXT FROM blockTypes INTO @ContentTypeID
                WHILE @@FETCH_STATUS = 0
                BEGIN
                    DELETE FROM @Usages
                    INSERT @Usages EXEC netPageTypeGetUsage @ContentTypeID, @OnlyPublished = 1

                    INSERT @Blocks (ContentTypeID, ContentID)
                    SELECT DISTINCT @ContentTypeID, ContentID FROM @Usages

                    FETCH NEXT FROM blockTypes INTO @ContentTypeID
                END
                CLOSE blockTypes
                DEALLOCATE blockTypes

                -- Walk soft links upwards (through blocks only), level by level. The primary key keeps every
                -- (block, owner) pair once, so shared/nested blocks don't multiply rows and cycles terminate.
                DECLARE @Owners TABLE (
                    ContentTypeID int,
                    ContentID int,
                    OwnerContentID int,
                    Depth int,
                    PRIMARY KEY (ContentTypeID, ContentID, OwnerContentID)
                )
                DECLARE @Depth int = 0
                DECLARE @Added int

                INSERT @Owners (ContentTypeID, ContentID, OwnerContentID, Depth)
                SELECT DISTINCT B.ContentTypeID, B.ContentID, SL.fkOwnerContentID, 0
                FROM @Blocks B
                INNER JOIN tblContent C ON C.pkID = B.ContentID
                INNER JOIN tblContentSoftlink SL ON SL.fkReferencedContentGUID = C.ContentGUID
                WHERE SL.LinkType = 1
                SET @Added = @@ROWCOUNT

                WHILE @Added > 0
                BEGIN
                    SET @Depth = @Depth + 1

                    INSERT @Owners (ContentTypeID, ContentID, OwnerContentID, Depth)
                    SELECT DISTINCT O.ContentTypeID, O.ContentID, SL.fkOwnerContentID, @Depth
                    FROM @Owners O
                    INNER JOIN tblContent C ON C.pkID = O.OwnerContentID
                    INNER JOIN tblContentSoftlink SL ON SL.fkReferencedContentGUID = C.ContentGUID
                    WHERE O.Depth = @Depth - 1
                        AND C.ContentType = 1
                        AND SL.LinkType = 1
                        AND NOT EXISTS (
                            SELECT 1 FROM @Owners X
                            WHERE X.ContentTypeID = O.ContentTypeID
                                AND X.ContentID = O.ContentID
                                AND X.OwnerContentID = SL.fkOwnerContentID)
                    SET @Added = @@ROWCOUNT
                END

                -- Keep owners that are currently published pages; count distinct (block, page) pairs per page type
                SELECT O.ContentTypeID AS BlockTypeID, CT.Name AS PageTypeName, COUNT(*) AS UsageCount
                FROM @Owners O
                INNER JOIN tblContent C ON C.pkID = O.OwnerContentID
                INNER JOIN tblContentType CT ON CT.pkID = C.fkContentTypeID
                WHERE C.ContentType = 0
                    AND EXISTS (
                        SELECT 1 FROM tblWorkContent WC
                        WHERE WC.fkContentID = O.OwnerContentID
                            AND WC.Status = 4
                            AND (WC.StopPublish IS NULL OR WC.StopPublish > @NowTime))
                GROUP BY O.ContentTypeID, CT.Name
            ";

            var statistics = new List<BlockTypeUsageStatistic>();
            await using var dbDataReader = await command.ExecuteReaderAsync(cancellationToken);
            while (await dbDataReader.ReadAsync(cancellationToken))
            {
                statistics.Add(new BlockTypeUsageStatistic
                {
                    BlockTypeId = (int)dbDataReader["BlockTypeID"],
                    PageTypeName = (string)dbDataReader["PageTypeName"],
                    UsageCount = (int)dbDataReader["UsageCount"]
                });
            }

            return statistics;
        }));
    }
}
