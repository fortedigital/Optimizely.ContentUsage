using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

[TsInterface]
public class GetContentTypesQuery
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public int Page { get; set; }
    public ContentTypesSorting? SortBy { get; set; }
}