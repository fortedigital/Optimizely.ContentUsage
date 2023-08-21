using System.Collections.Generic;
using System.Linq;

namespace Forte.Optimizely.ContentUsage.Api.Common;

public static class PaginationFilter
{
    public static IEnumerable<T> Paginate<T>(this IEnumerable<T> items, int pageNumber, int pageSize)
    {
        return items.Skip(pageNumber * pageSize).Take(pageSize);
    }
}