using System.Collections.Generic;
using Forte.EpiContentUsage.Api.Common;

namespace Forte.EpiContentUsage.Api.Features.ContentType;

public class ContentTypeSorter : CollectionSorter<ContentTypeDto>
{
    public IEnumerable<ContentTypeDto> Sort(IEnumerable<ContentTypeDto> collection, GetContentTypesQuery query)
    {
        return query?.SortBy switch
        {
            ContentTypesSorting.Name => SortBy(collection,dto => dto.DisplayName ?? dto.Name, query.Order),
            ContentTypesSorting.DisplayName => SortBy(collection,dto => dto.DisplayName, query.Order),
            ContentTypesSorting.Type => SortBy(collection,dto => dto.Type, query.Order),
            ContentTypesSorting.UsageCount => SortBy(collection,dto => dto.UsageCount, query.Order),
            _ => collection
        };
    }
}