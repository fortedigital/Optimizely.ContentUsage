using System.Linq;
using Forte.Optimizely.ContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentTypeBase;

[ApiController]
[Authorize(Policy = "episerver:defaultshellmodule")]
[Route("[controller]")]
public class ContentTypeBaseController : ControllerBase
{
    public const string GetContentTypeBasesRouteName = "ContentTypeBases";
    
    private readonly ContentTypeBaseService _contentTypeBaseService;
    
    public ContentTypeBaseController(ContentTypeBaseService contentTypeBaseService)
    {
        _contentTypeBaseService = contentTypeBaseService;
    }

    [HttpGet]
    [Route("[action]", Name = GetContentTypeBasesRouteName)]
    public ActionResult GetContentTypeBases()
    {
        var contentTypeBases = _contentTypeBaseService.GetAll();

        var contentTypeBaseDtos =
            contentTypeBases.Select(contentTypeBase => new ContentTypeBaseDto { Name = contentTypeBase.ToString() });

        return Ok(contentTypeBaseDtos);
    }
}