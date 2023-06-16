using System;
using Forte.EpiContentUsage.Api.Common;
using Reinforced.Typings.Attributes;

namespace Forte.EpiContentUsage.Api.Features.ContentUsage;

[TsInterface]
public class GetContentUsagesQuery
{
    public Guid Guid { get; set; }
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