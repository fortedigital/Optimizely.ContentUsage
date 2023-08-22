﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Forte.Optimizely.ContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Swashbuckle.AspNetCore.Annotations;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

[ApiController]
[Authorize(Policy = "episerver:defaultshellmodule")]
[Route("[controller]")]
public class ContentTypeController : ControllerBase
{
    public const string GetContentTypeRouteName = "ContentType";
    public const string GetContentTypesRouteName = "ContentTypes";

    private readonly ContentTypeMapper _contentTypeMapper;
    private readonly ContentTypeService _contentTypeService;

    public ContentTypeController(ContentTypeService contentTypeService, ContentTypeMapper contentTypeMapper)
    {
        _contentTypeService = contentTypeService;
        _contentTypeMapper = contentTypeMapper;
    }

    [HttpGet]
    [Route("[action]", Name = GetContentTypeRouteName)]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(ContentTypeDto))]
    [SwaggerResponse(StatusCodes.Status404NotFound)]
    public ActionResult GetContentType([FromQuery] [BindRequired] Guid guid)
    {
        var contentType = _contentTypeService.Get(guid);

        if (contentType == null)
            return NotFound();
            
        var contentTypeDto = _contentTypeMapper.Map(contentType);

        return Ok(contentTypeDto);
    }

    [HttpGet]
    [Route("[action]", Name = GetContentTypesRouteName)]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(IEnumerable<ContentTypeDto>))]
    public async Task<ActionResult> GetContentTypes([FromQuery] GetContentTypesQuery query, CancellationToken cancellationToken)
    {
        query!.IncludeDeleted ??= true;
        
        var contentTypesFilterCriteria = new ContentTypesFilterCriteria { Name = query?.Name, Type = query?.Type };
        
        var contentTypes =
            _contentTypeService.GetAll(contentTypesFilterCriteria);

        var contentTypesUsageCounters = await _contentTypeService.GetAllCounters(query.IncludeDeleted.Value, cancellationToken);
        var contentTypeDtos = contentTypes.Select(_contentTypeMapper.Map);

        contentTypeDtos = contentTypeDtos.Join(contentTypesUsageCounters, type => type.ID, counter => counter.ContentTypeId, (type, counter) =>
        {
            type.UsageCount = counter.Count;
            return type;
        });


        contentTypeDtos = query?.SortBy switch
        {
            ContentTypesSorting.Name => contentTypeDtos.OrderBy(dto => dto.DisplayName ?? dto.Name),
            ContentTypesSorting.UsageCount => contentTypeDtos.OrderBy(dto => dto.UsageCount),
            _ => contentTypeDtos
        };
        
        

        return Ok(contentTypeDtos);
    }
}