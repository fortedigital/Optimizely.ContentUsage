using System;
using System.Collections.Generic;
using System.Linq;

namespace Forte.Optimizely.ContentUsage.Api.Common;

public static class PagesCalculator
{
    public static int GetPageCount(this IEnumerable<object> collection, int itemsPerPage)
    {
        return (int)Math.Ceiling((double)collection.Count() / itemsPerPage);
    }
}