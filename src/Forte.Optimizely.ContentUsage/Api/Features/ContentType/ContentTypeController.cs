using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Forte.Optimizely.ContentUsage.Api.Extensions;
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

    private readonly ContentTypeDtoBuilder _contentTypeDtoBuilder;
    private readonly ContentTypeService _contentTypeService;

    public ContentTypeController(ContentTypeService contentTypeService, ContentTypeDtoBuilder contentTypeDtoBuilder)
    {
        _contentTypeService = contentTypeService;
        _contentTypeDtoBuilder = contentTypeDtoBuilder;
    }

    [HttpGet]
    [Route("[action]", Name = GetContentTypeRouteName)]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(ContentTypeDto))]
    [SwaggerResponse(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetContentType([FromQuery] [BindRequired] Guid guid,
        CancellationToken cancellationToken)
    {
        var contentType = _contentTypeService.Get(guid);

        if (contentType == null)
            return NotFound();

        var contentTypeDto = await _contentTypeDtoBuilder.Build(contentType, cancellationToken);

        return Ok(contentTypeDto);
    }

    [HttpGet]
    [Route("[action]", Name = GetContentTypesRouteName)]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(IEnumerable<ContentTypeDto>))]
    public async Task<ActionResult> GetContentTypes([FromQuery] GetContentTypesQuery? query,
        CancellationToken cancellationToken)
    {
        var contentTypesFilterCriteria = new ContentTypesFilterCriteria
            { Name = query?.NamePhrase, Types = query?.Types };

        var contentTypes =
            _contentTypeService.GetAll(contentTypesFilterCriteria).ToArray();

        var contentTypesUsageCounters = await _contentTypeService.GetAllCounters(cancellationToken);

        var contentTypeWithCounters = contentTypes.Join(contentTypesUsageCounters, type => type.ID,
            counter => counter.ContentTypeId,
            (contentType, usageCount) => new ContentTypeWithCounter
                { ContentType = contentType, UsageCount = usageCount.Count }).Sort(query);

        const int itemsPerPage = 25;

        var contentTypeDtos = await Task.WhenAll(contentTypeWithCounters
            .Paginate(query?.Page ?? 1, itemsPerPage)
            .Select(async type =>
            {
                var dto = await _contentTypeDtoBuilder.Build(type.ContentType, cancellationToken);
                dto.UsageCount = type.UsageCount;

                return dto;
            }));

        return Ok(new ContentTypesResponse
        {
            ContentTypes = contentTypeDtos,
            TotalPages = contentTypes.GetPageCount(itemsPerPage)
        });
    }
}