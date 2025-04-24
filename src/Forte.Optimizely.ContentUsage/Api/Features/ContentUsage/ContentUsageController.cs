using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer;
using EPiServer.DataAbstraction;
using Forte.Optimizely.ContentUsage.Api.Extensions;
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
    private readonly IContentRepository _contentRepository;

    public ContentUsageController(IContentTypeRepository contentTypeRepository, ContentUsageService contentUsageService, IContentRepository contentRepository)
    {
        _contentTypeRepository = contentTypeRepository;
        _contentUsageService = contentUsageService;
        _contentRepository = contentRepository;
    }

    [HttpGet]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(IEnumerable<ContentUsageDto>))]
    [SwaggerResponse(StatusCodes.Status404NotFound)]
    [Route("[action]", Name = GetContentUsagesRouteName)]
    public ActionResult GetContentUsages([FromQuery] GetContentUsagesQuery queryData)
    {
        var contentType = _contentTypeRepository.Load(queryData.Guid);

        if (contentType == null) 
            return NotFound();

        var contentUsagesQuery = _contentUsageService.GetContentUsages(contentType);

        contentUsagesQuery = string.IsNullOrEmpty(queryData.NamePhrase)
            ? contentUsagesQuery
            : contentUsagesQuery.Where(x =>
                x.Name.Contains(queryData.NamePhrase, StringComparison.InvariantCultureIgnoreCase));

        var contentUsages = contentUsagesQuery.ToArray();

        var contentUsageWithCount = contentUsages.Select(x => new ContentUsageWithCount()
        {
            ContentLink = x.ContentLink,
            LanguageBranch = x.LanguageBranch,
            Name = x.Name,
            UsageCount = !string.IsNullOrEmpty(x.LanguageBranch)
            ? _contentRepository.GetReferencesToContent(x.ContentLink, true).Where(y => y.OwnerLanguage.TwoLetterISOLanguageName.Equals(x.LanguageBranch)).Count()
            : _contentRepository.GetReferencesToContent(x.ContentLink, true).Count()
        });

        const int itemsPerPage = 25;

        var contentUsagesDto = contentUsageWithCount
            .Sort(queryData)
            .Paginate(queryData.Page, itemsPerPage)
            .Select(contentUsage => new ContentUsageDto
            {
                Id = contentUsage.ContentLink.ID,
                ContentTypeGuid = queryData.Guid,
                Name = contentUsage.Name,
                LanguageBranch = contentUsage.LanguageBranch,
                Pages = _contentUsageService.GetUsagePages(contentUsage).Select(usagePage =>
                    new UsagePageDto { PageType = usagePage.Page.PageTypeName, Url = usagePage.Url }),
                EditUrl = _contentUsageService.GetEditUrl(contentUsage),
                UsageCount = contentUsage.UsageCount
            });

        var totalPages = (int)Math.Ceiling(contentUsages.Length / (itemsPerPage * 1.0));

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