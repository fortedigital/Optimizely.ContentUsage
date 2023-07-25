using System;
using Forte.EpiContentUsage.Api.Common;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;

[TsInterface]
public class GetContentUsagesQuery
{
    public string Query { get; set; }
    public Guid Guid { get; set; }
    public int Page { get; set; }
    public ContentUsageSorting SortBy { get; set; }
    public SortDirection Order { get; set; }
}

[TsEnum(UseString = true)]
public enum ContentUsageSorting
{
    Id,
    Name,
    LanguageBranch,
    PageUrl
}