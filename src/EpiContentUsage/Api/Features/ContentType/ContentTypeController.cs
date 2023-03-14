﻿using System;
using System.Collections.Generic;
using System.Linq;
using Forte.EpiContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Swashbuckle.AspNetCore.Annotations;

namespace Forte.EpiContentUsage.Api.Features.ContentType;

[ApiController]
[Authorize(Policy = "episerver:defaultshellmodule")]
[Route("[controller]")]
public class ContentTypeController : ControllerBase
{
    public const string GetContentTypeRouteName = "ContentType";
    public const string GetContentTypesRouteName = "ContentTypes";

    private readonly ContentTypeMapper _contentTypeMapper;
    private readonly ContentTypeSorter _contentTypeSorter;
    private readonly ContentTypeService _contentTypeService;

    public ContentTypeController(
        ContentTypeService contentTypeService,
        ContentTypeMapper contentTypeMapper,
        ContentTypeSorter contentTypeSorter)
    {
        _contentTypeService = contentTypeService;
        _contentTypeMapper = contentTypeMapper;
        _contentTypeSorter = contentTypeSorter;
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
    public ActionResult GetContentTypes([FromQuery] GetContentTypesQuery? query)
    {
        var contentTypes =
            _contentTypeService.GetAll(new ContentTypesFilterCriteria { Name = query?.Name, Type = query?.Type });

        var contentTypeDtos = contentTypes.Select(_contentTypeMapper.Map);

        contentTypeDtos = _contentTypeSorter.Sort(contentTypeDtos, query);

        return Ok(contentTypeDtos);
    }
}