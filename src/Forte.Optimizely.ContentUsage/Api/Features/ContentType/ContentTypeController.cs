using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Forte.Optimizely.ContentUsage.Api.Common;
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
    public ActionResult GetContentType([FromQuery] [BindRequired] Guid guid)
    {
        var contentType = _contentTypeService.Get(guid);

        if (contentType == null)
            return NotFound();

        var contentTypeDto = _contentTypeDtoBuilder.Build(contentType);

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

        var contentTypeDtos = contentTypeWithCounters
            .Paginate(query?.Page ?? 1, itemsPerPage)
            .Select(type =>
            {
                var dto = _contentTypeDtoBuilder.Build(type.ContentType);
                dto.UsageCount = type.UsageCount;

                return dto;
            });

        return Ok(new ContentTypesResponse
        {
            ContentTypes = contentTypeDtos,
            TotalPages = contentTypes.GetPageCount(itemsPerPage)
        });
    }
}