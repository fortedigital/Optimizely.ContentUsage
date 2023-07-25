using System;
using System.Collections.Generic;
using System.Linq;

namespace Forte.EpiContentUsage.Api.Common;

public abstract class CollectionSorter<TSource>
{
    protected IEnumerable<TSource> SortBy<TKey>(IEnumerable<TSource> collection, Func<TSource, TKey> sorter, SortDirection? directions = SortDirection.Ascending)
    {
        return directions switch
        {
            SortDirection.Ascending => collection.OrderBy(sorter),
            SortDirection.Descending => collection.OrderByDescending(sorter),
            _ => throw new ArgumentOutOfRangeException(nameof(directions), directions, null)
        };
    }
}