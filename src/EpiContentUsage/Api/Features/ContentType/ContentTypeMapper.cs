using EPiServer.Core;
using EPiServer.ServiceLocation;

namespace Forte.EpiContentUsage.Api.Features.ContentType;

[ServiceConfiguration(Lifecycle = ServiceInstanceScope.Scoped)]
public class ContentTypeMapper
{
    private readonly IContentModelUsage _contentModelUsage;

    public ContentTypeMapper(IContentModelUsage contentModelUsage)
    {
        _contentModelUsage = contentModelUsage;
    }

    public ContentTypeDto Map(EPiServer.DataAbstraction.ContentType contentType)
    {
        var dto = new ContentTypeDto
        {
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString(),
            UsageCount = _contentModelUsage.ListContentOfContentType(contentType).Count
        };

        return dto;
    }
}