using Forte.Optimizely.ContentUsage.Api.Common;
using Microsoft.AspNetCore.Mvc;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

[TsInterface]
public class GetContentTypesQuery
{
    public string? NamePhrase { get; set; }

    [ModelBinder(BinderType = typeof(CommaSeparatedModelBinder))]
    public string[] Types { get; set; }

    public int Page { get; set; }
    public ContentTypesSorting? SortBy { get; set; }
}