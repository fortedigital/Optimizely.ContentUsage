using System.Linq;
using Forte.Optimizely.ContentUsage.Api.Services;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeMapper
{
    private readonly ContentUsageService _contentUsageService;
    
    public ContentTypeMapper(ContentUsageService contentUsageService)
    {
        _contentUsageService = contentUsageService;
    }

    public ContentTypeDto Map(EPiServer.DataAbstraction.ContentType contentType)
    {
        var dto = new ContentTypeDto
        {
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString(),
            UsageCount = _contentUsageService.GetContentUsages(contentType).Count()
        };

        return dto;
    }
}