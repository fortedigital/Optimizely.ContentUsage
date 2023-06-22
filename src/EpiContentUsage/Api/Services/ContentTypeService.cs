using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.DataAbstraction;

namespace Forte.EpiContentUsage.Api.Services;

public class ContentTypeService
{
    private readonly IContentTypeRepository _contentTypeRepository;
    private readonly ContentTypeBaseService _contentTypeBaseService;

    public ContentTypeService(IContentTypeRepository contentTypeRepository, ContentTypeBaseService contentTypeBaseService)
    {
        _contentTypeRepository = contentTypeRepository;
        _contentTypeBaseService = contentTypeBaseService;
    }

    public IEnumerable<ContentType> GetAll(ContentTypesFilterCriteria? filterCriteria)
    {
        var contentTypeBases = _contentTypeBaseService.GetAll();
        
        var contentTypes = _contentTypeRepository.List()
            .Where(type => contentTypeBases.Any(ctb => ctb == type.Base));

        if (filterCriteria != null)
        {
            contentTypes = Filter(contentTypes, filterCriteria);
        }

        return contentTypes;
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