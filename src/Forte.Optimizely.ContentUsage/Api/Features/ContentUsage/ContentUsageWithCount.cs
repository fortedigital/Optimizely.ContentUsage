namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage
{
    public class ContentUsageWithCount : EPiServer.DataAbstraction.ContentUsage
    {
        public int UsageCount { get; set; }
    }
}
