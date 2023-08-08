
namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class GetContentTypesQuery
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public ContentTypesSorting? SortBy { get; set; }
}