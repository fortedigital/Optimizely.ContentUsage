using Forte.EpiContentUsage.Api.Common;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

[TsInterface]
public class GetContentTypesQuery
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public ContentTypesSorting? SortBy { get; set; }
    public SortDirection? Order { get; set; }
}

[TsEnum(UseString = true)]
public enum ContentTypesSorting
{
    Name = 0,
    DisplayName,
    Type,
    UsageCount,
}