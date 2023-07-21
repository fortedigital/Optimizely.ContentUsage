
namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeMapper
{
    public ContentTypeDto Map(EPiServer.DataAbstraction.ContentType contentType)
    {
        var dto = new ContentTypeDto
        {
            ID = contentType.ID,
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString(),
        };

        return dto;
    }
}