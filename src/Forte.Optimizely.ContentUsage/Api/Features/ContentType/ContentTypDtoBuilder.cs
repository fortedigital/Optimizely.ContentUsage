using System;
using System.Collections.Generic;
using System.Linq;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeDtoBuilder
{
    public ContentTypeDto Build(EPiServer.DataAbstraction.ContentType contentType,
        IEnumerable<BlockTypeUsageStatistic> statistics = null)
    {
        return new ContentTypeDto
        {
            ID = contentType.ID,
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString(),
            Statistics = statistics?
                .Select(statistic => new UsageStatisticDto
                    { PageTypeName = statistic.PageTypeName, UsageCount = statistic.UsageCount })
                .OrderByDescending(statistic => statistic.UsageCount)
                .ToArray() ?? Array.Empty<UsageStatisticDto>()
        };
    }
}
