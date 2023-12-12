using EPiServer.Core;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class UsagePageReference
{
    public ContentReference ContentLink { get; set; }
    public string PageType { get; set; }
}