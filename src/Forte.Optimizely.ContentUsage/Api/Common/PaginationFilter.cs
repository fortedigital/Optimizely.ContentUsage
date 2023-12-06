using System.Collections.Generic;
using System.Linq;

namespace Forte.Optimizely.ContentUsage.Api.Common;

public static class PaginationFilter
{
    /// <param name="pageNumber">One-based page number</param>
    public static IEnumerable<T> Paginate<T>(this IEnumerable<T> items, int pageNumber, int pageSize)
    {
        return items.Skip((pageNumber - 1) * pageSize).Take(pageSize);
    }
}