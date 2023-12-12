using System;
using System.Collections.Generic;
using System.Linq;
using Forte.EpiContentUsage.Api.Common;

namespace Forte.Optimizely.ContentUsage.Api.Extensions;

public static class CollectionExtensions
{
    public static IEnumerable<TSource> SortBy<TSource, TKey>(this IEnumerable<TSource> collection,
        Func<TSource, TKey> sorter, SortDirection? directions = SortDirection.Asc)
    {
        return directions switch
        {
            SortDirection.Asc => collection.OrderBy(sorter),
            SortDirection.Desc => collection.OrderByDescending(sorter),
            _ => throw new ArgumentOutOfRangeException(nameof(directions), directions, null)
        };
    }

    public static int GetPageCount(this IEnumerable<object> collection, int itemsPerPage)
    {
        return (int)Math.Ceiling((double)collection.Count() / itemsPerPage);
    }

    /// <param name="pageNumber">One-based page number</param>
    public static IEnumerable<T> Paginate<T>(this IEnumerable<T> items, int pageNumber, int pageSize)
    {
        return items.Skip((pageNumber - 1) * pageSize).Take(pageSize);
    }
}