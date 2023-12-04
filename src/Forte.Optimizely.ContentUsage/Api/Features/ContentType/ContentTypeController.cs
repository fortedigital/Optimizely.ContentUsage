using System;
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
    private readonly ContentUsageService _contentUsageService;

    public ContentTypeController(ContentTypeService contentTypeService, ContentTypeMapper contentTypeMapper,
        ContentUsageService contentUsageService)
    {
        _contentTypeService = contentTypeService;
        _contentTypeMapper = contentTypeMapper;
        _contentUsageService = contentUsageService;
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
    public async Task<ActionResult> GetContentTypes([FromQuery] GetContentTypesQuery? query,
        CancellationToken cancellationToken)
    {
        var contentTypesFilterCriteria = new ContentTypesFilterCriteria { Name = query?.Name, Type = query?.Type };

        var contentTypes =
            _contentTypeService.GetAll(contentTypesFilterCriteria);

        var contentTypeWithDtos = contentTypes.Select(contentType =>
            new { ContentType = contentType, Dto = _contentTypeMapper.Map(contentType) });

        var contentTypesUsageCounters = await _contentTypeService.GetAllCounters(cancellationToken);
        contentTypeWithDtos = contentTypeWithDtos.Join(contentTypesUsageCounters, type => type.ContentType.ID,
            counter => counter.ContentTypeId, (type, counter) =>
            {
                type.Dto.UsageCount = counter.Count;
                return type;
            });

        contentTypeWithDtos = query?.SortBy switch
        {
            ContentTypesSorting.Name => contentTypeWithDtos.OrderBy(type => type.Dto.DisplayName ?? type.Dto.Name),
            ContentTypesSorting.UsageCount => contentTypeWithDtos.OrderBy(dto => dto.Dto.UsageCount),
            _ => contentTypeWithDtos
        };

        const int itemsPerPage = 25;
        var contentTypeDtos = contentTypeWithDtos
            // .Paginate(query?.Page ?? 0, itemsPerPage)
            .Select(type =>
        {
            var usages = _contentUsageService.GetContentUsages(type.ContentType);

            type.Dto.Statistics = usages.SelectMany(usage => _contentUsageService.GetUsagePages(usage))
                .GroupBy(page => page.PageTypeName)
                .Select(group => new UsageStatisticDto { PageTypeName = group.Key, UsageCount = group.Count() })
                .OrderByDescending(statistic => statistic.UsageCount);

            return type.Dto;
        });

        return Ok(contentTypeDtos);
    }
}