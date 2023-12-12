using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EPiServer.DataAbstraction;
using Forte.Optimizely.ContentUsage.Api.Features.ContentType;

namespace Forte.Optimizely.ContentUsage.Api.Services;

public class ContentTypeService
{
    private readonly IContentTypeRepository _contentTypeRepository;
    private readonly ContentTypeUsagesRepository _contentTypeUsagesRepository;


    public ContentTypeService(IContentTypeRepository contentTypeRepository,
        ContentTypeUsagesRepository contentTypeUsagesRepository)
    {
        _contentTypeRepository = contentTypeRepository;
        _contentTypeUsagesRepository = contentTypeUsagesRepository;
    }

    public IEnumerable<ContentType> GetAll(ContentTypesFilterCriteria? filterCriteria)
    {
        var contentTypes = _contentTypeRepository.List();

        if (filterCriteria != null)
        {
            contentTypes = Filter(contentTypes, filterCriteria);
        }

        return contentTypes;
    }

    public async Task<IEnumerable<ContentTypeUsageCounter>> GetAllCounters(CancellationToken cancellationToken)
    {
        return await _contentTypeUsagesRepository.ListContentTypesUsagesCounters(cancellationToken);
    }

    public ContentType? Get(Guid guid)
    {
        var contentType = _contentTypeRepository.Load(guid);

        return contentType;
    }

    private static IEnumerable<ContentType> Filter(IEnumerable<ContentType> contentTypes,
        ContentTypesFilterCriteria? filterCriteria)
    {
        var filteredContentTypes = contentTypes;

        if (!string.IsNullOrEmpty(filterCriteria?.Name))
            filteredContentTypes = filteredContentTypes.Where(t =>
                (!string.IsNullOrEmpty(t.DisplayName) &&
                 t.DisplayName.Contains(filterCriteria.Name, StringComparison.InvariantCultureIgnoreCase)) ||
                t.Name.Contains(filterCriteria.Name, StringComparison.InvariantCultureIgnoreCase));

        if (filterCriteria?.Types != null)
            filteredContentTypes = filteredContentTypes.Where(t =>
                !string.IsNullOrEmpty(t.Base.ToString()) && filterCriteria.Types.Any(filterType =>
                    t.Base.ToString().Equals(filterType, StringComparison.InvariantCultureIgnoreCase))
            );

        return filteredContentTypes;
    }
}

public class ContentTypesFilterCriteria
{
    public string? Name { get; set; }
    public string[]? Types { get; set; }
}