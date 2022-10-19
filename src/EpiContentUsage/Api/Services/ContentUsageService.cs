using System.Collections.Generic;
using System.Linq;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Editor;
using EPiServer.Web.Routing;

namespace Forte.EpiContentUsage.Api.Services;

public class ContentUsageService
{
    private readonly IContentSoftLinkRepository _contentSoftLinkRepository;
    private readonly IUrlResolver _urlResolver;

    public ContentUsageService(IUrlResolver urlResolver, IContentSoftLinkRepository contentSoftLinkRepository)
    {
        _urlResolver = urlResolver;
        _contentSoftLinkRepository = contentSoftLinkRepository;
    }

    public IEnumerable<string> GetPageUrls(ContentReference contentLink)
    {
        var url = _urlResolver.GetUrl(contentLink);

        if (!string.IsNullOrEmpty(url)) return new[] { url };

        var urls = _contentSoftLinkRepository.Load(contentLink, true)
            .Where(softLink => softLink.SoftLinkType == ReferenceType.PageLinkReference &&
                               !ContentReference.IsNullOrEmpty(softLink.OwnerContentLink))
            .Select(softLink => _urlResolver.GetUrl(softLink.OwnerContentLink));

        return urls;
    }

    public string GetEditUrl(ContentUsage contentUsage)
    {
        return PageEditing.GetEditUrl(contentUsage.ContentLink);
    }
}