using System.Collections.Generic;
using System.Linq;
using Forte.EpiContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Forte.EpiContentUsage.Api.Features.ContentTypeBase;

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
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(IEnumerable<ContentTypeBaseDto>))]
    [Route("[action]", Name = GetContentTypeBasesRouteName)]
    public ActionResult GetContentTypeBases()
    {
        var contentTypeBases = _contentTypeBaseService.GetAll();

        var contentTypeBaseDtos =
            contentTypeBases.Select(contentTypeBase => new ContentTypeBaseDto { Name = contentTypeBase.ToString() });

        return Ok(contentTypeBaseDtos);
    }
}