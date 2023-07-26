using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.DataAbstraction;
using Forte.Optimizely.ContentUsage.Api.Features.ContentType;

namespace Forte.Optimizely.ContentUsage.Api.Services;

public class ContentTypeService
{
    private readonly IContentTypeRepository _contentTypeRepository;
    private readonly ContentTypeUsagesDB _contentTypeUsagesDB;


    public ContentTypeService(IContentTypeRepository contentTypeRepository, ContentTypeUsagesDB contentTypeUsagesDb)
    {
        _contentTypeRepository = contentTypeRepository;
        _contentTypeUsagesDB = contentTypeUsagesDb;
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
    
    public IEnumerable<ContentTypeUsageCounter> GetAllCounters()
    {
        return _contentTypeUsagesDB.ListContentTypesUsagesCounters();
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
        {
            filteredContentTypes = filteredContentTypes.Where(t =>
                (!string.IsNullOrEmpty(t.DisplayName) &&
                 t.DisplayName.Contains(filterCriteria.Name, StringComparison.InvariantCultureIgnoreCase)) ||
                t.Name.Contains(filterCriteria.Name, StringComparison.InvariantCultureIgnoreCase));
        }

        if (!string.IsNullOrEmpty(filterCriteria?.Type))
        {
            filteredContentTypes = filteredContentTypes.Where(t =>
                !string.IsNullOrEmpty(t.Base.ToString()) &&
                t.Base.ToString().Equals(filterCriteria.Type, StringComparison.InvariantCultureIgnoreCase));
        }

        return filteredContentTypes;
    }
}

public class ContentTypesFilterCriteria
{
    public string? Name { get; set; }
    public string? Type { get; set; }
}