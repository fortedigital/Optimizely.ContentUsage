using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.DataAbstraction;
using Forte.Optimizely.ContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    public ActionResult GetContentUsages([FromQuery] GetContentUsagesQuery query)
    {
        var contentType = _contentTypeRepository.Load(query.Guid);

        if (contentType == null) return NotFound();

        var contentUsages = _contentUsageService.GetContentUsages(contentType);

        var contentUsagesDto = contentUsages.Select(contentUsage => new ContentUsageDto
        {
            Id = contentUsage.ContentLink.ID,
            ContentTypeGuid = query.Guid,
            Name = contentUsage.Name,
            LanguageBranch = contentUsage.LanguageBranch,
            PageUrls = _contentUsageService.GetPageUrls(contentUsage),
            EditUrl = _contentUsageService.GetEditUrl(contentUsage)
        });

        contentUsagesDto = _contentUsageSorter.Sort(contentUsagesDto, query);

        return Ok(contentUsagesDto);
    }
}