using System.Collections.Generic;
using System.Linq;

namespace Forte.Optimizely.ContentUsage.Api.Common;

public static class PaginationFilter
{
    public static IEnumerable<T> PaginateFromPage1<T>(this IEnumerable<T> items, int pageNumber, int pageSize)
    {
        return items.Skip((pageNumber - 1) * pageSize).Take(pageSize);
    }
}