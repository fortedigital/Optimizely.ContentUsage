using System;
using Forte.EpiContentUsage.Api.Common;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;

[TsInterface]
public class GetContentUsagesQuery
{
    public string NamePhrase { get; set; }
    public Guid Guid { get; set; }
    public int Page { get; set; }
    public ContentUsageSorting SortBy { get; set; }
    public SortDirection Order { get; set; }
}