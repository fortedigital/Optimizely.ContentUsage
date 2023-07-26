using System;
using Forte.EpiContentUsage.Api.Common;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;

public class GetContentUsagesQuery
{
    public string Query { get; set; }
    public Guid Guid { get; set; }
    public int Page { get; set; }
    public ContentUsageSorting SortBy { get; set; }
    public SortDirection Order { get; set; }
}

public enum ContentUsageSorting
{
    Id,
    Name,
    LanguageBranch
}