using EPiServer.Core;
using EpiserverContentUsage.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace EpiserverContentUsage.Api.Features.ContentType;

[ApiController]
[Authorize(Roles = "CmsAdmins")]
[Route("[controller]")]
public class ContentTypeController : ControllerBase
{
    public const string GetContentTypesRouteName = "ContentTypes";
    private readonly IContentModelUsage _contentModelUsage;

    private readonly ContentTypeService _contentTypeService;

    public ContentTypeController(ContentTypeService contentTypeService, IContentModelUsage contentModelUsage)
    {
        _contentTypeService = contentTypeService;
        _contentModelUsage = contentModelUsage;
    }

    [HttpGet]
    [Route("[action]", Name = GetContentTypesRouteName)]
    [SwaggerResponse(StatusCodes.Status200OK, null, typeof(IEnumerable<ContentTypeDto>))]
    public ActionResult GetContentTypes([FromQuery] GetContentTypesQuery? query)
    {
        var contentTypes =
            _contentTypeService.GetAll(new ContentTypesFilterCriteria { Name = query?.Name, Type = query?.Type });

        var contentTypeDtos = contentTypes.Select(contentType =>
            new ContentTypeDto
            {
                DisplayName = contentType.DisplayName,
                Name = contentType.Name,
                Guid = contentType.GUID,
                Type = contentType.Base.ToString(),
                UsageCount = _contentModelUsage.ListContentOfContentType(contentType).Count
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