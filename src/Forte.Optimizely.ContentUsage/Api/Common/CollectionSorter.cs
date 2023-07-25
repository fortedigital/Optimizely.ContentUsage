using System;
using System.Collections.Generic;
using System.Linq;

namespace Forte.EpiContentUsage.Api.Common;

public static class CollectionSorter
{
    public static IEnumerable<TSource> SortBy<TSource, TKey>(this IEnumerable<TSource> collection, Func<TSource, TKey> sorter, SortDirection? directions = SortDirection.Asc)
    {
        return directions switch
        {
            SortDirection.Asc => collection.OrderBy(sorter),
            SortDirection.Desc => collection.OrderByDescending(sorter),
            _ => throw new ArgumentOutOfRangeException(nameof(directions), directions, null)
        };
    }
}