using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EPiServer.Data;
using EPiServer.ServiceLocation;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeUsagesRepository 
{
	private readonly ServiceAccessor<IAsyncDatabaseExecutor> dataExecutorAccessor;

    public ContentTypeUsagesRepository(ServiceAccessor<IAsyncDatabaseExecutor> dataExecutorAccessor)
    {
	    this.dataExecutorAccessor = dataExecutorAccessor;
    }

    public async Task<IEnumerable<ContentTypeUsageCounter>> ListContentTypesUsagesCounters(
	    CancellationToken cancellationToken)
    {
        var executor = this.dataExecutorAccessor();
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
}