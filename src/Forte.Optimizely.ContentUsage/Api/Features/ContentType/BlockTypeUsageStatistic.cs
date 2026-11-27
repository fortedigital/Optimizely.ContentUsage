namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public struct BlockTypeUsageStatistic
{
    public int BlockTypeId { get; set; }
    public string PageTypeName { get; set; }
    public int UsageCount { get; set; }
}
