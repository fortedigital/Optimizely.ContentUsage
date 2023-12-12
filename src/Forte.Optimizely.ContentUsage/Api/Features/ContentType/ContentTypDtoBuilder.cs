using System;
using System.Linq;
using EPiServer.DataAbstraction;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeDtoBuilder
{
    private readonly ContentTypeUsagesRepository _contentTypeUsagesRepository;

    public ContentTypeDtoBuilder(ContentTypeUsagesRepository contentTypeUsagesRepository)
    {
        _contentTypeUsagesRepository = contentTypeUsagesRepository;
    }

    public ContentTypeDto Build(EPiServer.DataAbstraction.ContentType contentType)
    {
        var dto = new ContentTypeDto
        {
            ID = contentType.ID,
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString(),
            Statistics = Array.Empty<UsageStatisticDto>()
        };

        if (contentType is not BlockType blockType)
            return dto;

        var usagePages = _contentTypeUsagesRepository.GetUsagePages(blockType);
        
        dto.Statistics = usagePages
            .GroupBy(usagePage => usagePage.PageType)
            .Select(group => new UsageStatisticDto { PageTypeName = group.Key, UsageCount = group.Count() })
            .OrderByDescending(statistic => statistic.UsageCount);

        return dto;
    }
}