using System.Collections.Generic;
using Forte.Optimizely.ContentUsage.Api.Extensions;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;

public static class ContentUsageSorter
{
    public static IEnumerable<EPiServer.DataAbstraction.ContentUsage> Sort(this IEnumerable<EPiServer.DataAbstraction.ContentUsage> collection, GetContentUsagesQuery query)
    {
        return query?.SortBy switch
        {
            ContentUsageSorting.Id => collection.SortBy(dto => dto.ContentLink.ID, query.Order),
            ContentUsageSorting.Name => collection.SortBy(dto => dto.Name, query.Order),
            ContentUsageSorting.LanguageBranch => collection.SortBy(dto => dto.LanguageBranch, query.Order),
            _ => collection
        };
    }
}