using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EPiServer.Core;
using EPiServer.Data;
using EPiServer.DataAbstraction;
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

    public async Task<IEnumerable<UsagePage>> GetUsagePages(BlockType contentType, CancellationToken cancellationToken)
    {
        var executor = _dataExecutorAccessor();
        return await executor.ExecuteAsync(async () =>
        {
            var command = executor.CreateCommand();
            command.CommandText = @"
DECLARE @Usages TABLE (ContentID int, WorkID int, [Name] nvarchar(255), LanguageBranch nchar(17))
INSERT @Usages EXEC netPageTypeGetUsage @PageTypeID,@OnlyPublished=1

;WITH OwnerContent_CTE AS (
	SELECT U.ContentID, tblContentSoftlink.fkOwnerContentID AS OwnerContentId
	FROM @Usages U
	INNER JOIN tblContent ON tblContent.pkID = U.ContentId
	INNER JOIN tblContentSoftlink ON tblContentSoftlink.fkReferencedContentGUID = tblContent.ContentGUID
	WHERE tblContentSoftlink.LinkType=1

	UNION ALL

	SELECT OwnerContent_CTE.ContentID, tblContentSoftlink.fkOwnerContentID AS OwnerContentId
	FROM OwnerContent_CTE
	INNER JOIN tblContent ON tblContent.pkID = OwnerContent_CTE.OwnerContentID
	INNER JOIN tblContentSoftlink ON tblContentSoftlink.fkReferencedContentGUID = tblContent.ContentGUID
	WHERE tblContentSoftlink.LinkType=1
		AND tblContent.ContentType=1
)
SELECT OwnerContent_CTE.ContentID, OwnerContent_CTE.OwnerContentID, tblContentType.Name AS OwnerContentName
FROM OwnerContent_CTE
INNER JOIN tblContent ON tblContent.pkID = OwnerContent_CTE.OwnerContentId
INNER JOIN tblContentType ON tblContentType.pkID = tblContent.fkContentTypeID
INNER JOIN tblWorkContent ON tblWorkContent.fkContentID = OwnerContent_CTE.OwnerContentId
WHERE tblContent.ContentType = 0
AND tblWorkContent.Status=4
AND (tblWorkContent.StopPublish IS NULL OR tblWorkContent.StopPublish > @NowTime)
";

            command.Parameters.Add(executor.CreateParameter("PageTypeID", contentType.ID));
            command.Parameters.Add(executor.CreateParameter("NowTime",
                _databaseDateTimeHandler.ConvertToDatabase(DateTime.Now)));

            var usagePages = new List<UsagePage>();
            await using var dbDataReader = await command.ExecuteReaderAsync(cancellationToken);
            while (await dbDataReader.ReadAsync(cancellationToken))
            {
                var contentTypeUsageCounter = new UsagePage
                {
                    ContentLink = new ContentReference((int)dbDataReader["OwnerContentID"]),
                    PageType = (string)dbDataReader["OwnerContentName"]
                };

                usagePages.Add(contentTypeUsageCounter);
            }

            return usagePages;
        });
    }
}

public class UsagePage
{
    public ContentReference ContentLink { get; set; }
    public string PageType { get; set; }
}