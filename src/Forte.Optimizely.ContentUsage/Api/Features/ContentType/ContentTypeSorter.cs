using System.Collections.Generic;
using Forte.Optimizely.ContentUsage.Api.Extensions;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public static class ContentTypeSorter
{
    public static IEnumerable<ContentTypeWithCounter> Sort(this IEnumerable<ContentTypeWithCounter> collection,
        GetContentTypesQuery query)
    {
        return query?.SortBy switch
        {
            ContentTypesSorting.Name => collection.SortBy(type =>
                type.ContentType.DisplayName ?? type.ContentType.Name, query.Order),
            ContentTypesSorting.UsageCount => collection.SortBy(type => type.UsageCount, query.Order),
            _ => collection
        };
    }
}

public class ContentTypeWithCounter
{
    public EPiServer.DataAbstraction.ContentType ContentType { get; set; }
    public int UsageCount { get; set; }
}