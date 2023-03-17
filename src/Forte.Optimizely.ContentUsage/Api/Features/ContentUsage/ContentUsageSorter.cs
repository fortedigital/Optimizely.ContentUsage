using System.Collections.Generic;
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
            ContentUsageSorting.Language => SortBy(collection,dto => dto.LanguageBranch, query.Order),
            ContentUsageSorting.Url => SortBy(collection,dto => dto.PageUrls, query.Order),
            _ => collection
        };
    }
}