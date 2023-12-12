using EPiServer.Core;

namespace Forte.Optimizely.ContentUsage.Api.Services;

public class UsagePage
{
    public string Url { get; set; }
    public PageData Page { get; set; }
}