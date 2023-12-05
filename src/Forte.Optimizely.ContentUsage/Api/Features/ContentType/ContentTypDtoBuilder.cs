using System.Linq;
using Forte.Optimizely.ContentUsage.Api.Services;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeDtoBuilder
{
    private readonly ContentUsageService _contentUsageService;

    public ContentTypeDtoBuilder(ContentUsageService contentUsageService)
    {
        _contentUsageService = contentUsageService;
    }

    public ContentTypeDto Build(EPiServer.DataAbstraction.ContentType contentType)
    {
        var dto = new ContentTypeDto
        {
            ID = contentType.ID,
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString()
        };

        var usages = _contentUsageService.GetContentUsages(contentType);

        dto.Statistics = usages.SelectMany(usage => _contentUsageService.GetUsagePages(usage))
            .GroupBy(usagePage => usagePage.Page.PageTypeName)
            .Select(group => new UsageStatisticDto { PageTypeName = group.Key, UsageCount = group.Count() })
            .OrderByDescending(statistic => statistic.UsageCount);

        return dto;
    }
}