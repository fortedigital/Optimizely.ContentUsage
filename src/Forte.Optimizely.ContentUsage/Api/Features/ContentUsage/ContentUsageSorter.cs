using System.Collections.Generic;
using System.Linq;
using Forte.EpiContentUsage.Api.Common;

namespace Forte.EpiContentUsage.Api.Features.ContentUsage;

public class ContentUsageSorter : CollectionSorter<ContentUsageDto>
{
    public IEnumerable<ContentUsageDto> Sort(IEnumerable<ContentUsageDto> collection, GetContentUsagesQuery query)
    {
        return query?.SortBy switch
        {
            ContentUsageSorting.Id => SortBy(collection,dto => dto.Id, query.Order),
            ContentUsageSorting.Name => SortBy(collection,dto => dto.Name, query.Order),
            ContentUsageSorting.LanguageBranch => SortBy(collection,dto => dto.LanguageBranch, query.Order),
            ContentUsageSorting.PageUrl => SortBy(collection,dto => dto.PageUrls.Count(), query.Order),
            _ => collection
        };
    }
}