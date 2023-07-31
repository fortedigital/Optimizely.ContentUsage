using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.DataAbstraction;
using Forte.Optimizely.ContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Reinforced.Typings.Attributes;
using Swashbuckle.AspNetCore.Annotations;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;

[ApiController]
[Authorize(Policy = "episerver:defaultshellmodule")]
[Route("[controller]")]
public class ContentUsageController : ControllerBase
{
    public const string GetContentUsagesRouteName = "ContentUsages";

    private readonly IContentTypeRepository _contentTypeRepository;
    private readonly ContentUsageService _contentUsageService;

    public ContentUsageController(IContentTypeRepository contentTypeRepository, ContentUsageService contentUsageService)
    {
        _contentTypeRepository = contentTypeRepository;
        _contentUsageService = contentUsageService;
    }

    [HttpGet]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(IEnumerable<ContentUsageDto>))]
    [SwaggerResponse(StatusCodes.Status404NotFound)]
    [Route("[action]", Name = GetContentUsagesRouteName)]
    public ActionResult GetContentUsages([FromQuery] GetContentUsagesQuery queryData)
    {
        var contentType = _contentTypeRepository.Load(queryData.Guid);

        if (contentType == null) return NotFound();

        var contentUsagesQuery = _contentUsageService.GetContentUsages(contentType);

        contentUsagesQuery = string.IsNullOrEmpty(queryData.Query)
            ? contentUsagesQuery
            : contentUsagesQuery.Where(x => x.Name.Contains(queryData.Query, StringComparison.InvariantCultureIgnoreCase));
        
        var contentUsages = contentUsagesQuery.ToArray();
        
        var currentPage = queryData.Page - 1;
        
        const int itemsPerPage = 25;
        var contentUsagesDto = contentUsages
            .Sort(queryData)
            .Skip(currentPage * itemsPerPage)
            .Take(itemsPerPage)
            .Select(contentUsage => new ContentUsageDto
        {
            Id = contentUsage.ContentLink.ID,
            ContentTypeGuid = queryData.Guid,
            Name = contentUsage.Name,
            LanguageBranch = contentUsage.LanguageBranch,
            PageUrls = _contentUsageService.GetPageUrls(contentUsage),
            EditUrl = _contentUsageService.GetEditUrl(contentUsage)
        });

        var totalPages = (int) Math.Ceiling(contentUsages.Length / (itemsPerPage * 1.0));
        return Ok(new GetContentUsagesResponse
        {
            ContentUsages = contentUsagesDto,
            TotalPages = totalPages
        });
    }
}

[TsInterface]
public class GetContentUsagesResponse
{
    public int TotalPages { get; set; }
    public IEnumerable<ContentUsageDto> ContentUsages { get; set; }
}