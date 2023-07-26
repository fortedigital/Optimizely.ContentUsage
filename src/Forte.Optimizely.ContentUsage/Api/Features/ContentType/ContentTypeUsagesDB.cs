using System;
using System.Collections.Generic;
using System.Data.Common;
using EPiServer.Construction;
using EPiServer.Core;
using EPiServer.Data;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Blobs;
using EPiServer.ServiceLocation;
using EPiServer.Web;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeUsagesDB 
{
	private readonly ServiceAccessor<IDatabaseExecutor> _dataExecutorAccessor;

    public ContentTypeUsagesDB(ServiceAccessor<IDatabaseExecutor> dataExecutorAccessor)
    {
	    _dataExecutorAccessor = dataExecutorAccessor;
    }

    public IList<ContentTypeUsageCounter> ListContentTypesUsagesCounters()
    {
        IDatabaseExecutor executor = _dataExecutorAccessor();
        return executor.Execute((Func<IList<ContentTypeUsageCounter>>)(() =>
        {
            DbCommand command1 = executor.CreateCommand();
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
            using (DbDataReader dbDataReader = command1.ExecuteReader())
            {
                while (dbDataReader.Read())
                {
                    var contentTypeUsageCounter = new ContentTypeUsageCounter
                    {

                        ContentTypeId = (int)dbDataReader["ContentTypeId"],
                        Count = (int)dbDataReader["Count"]
                    };

                    contentTypeUsageCounters.Add(contentTypeUsageCounter);
                }
            }

            return contentTypeUsageCounters;
        }));
    }
}

public class ContentTypeUsageCounter
{
    public int ContentTypeId { get; set; }
    public int Count { get; set; }
}