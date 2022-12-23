using System.Collections.Generic;
using System.Linq;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Editor;
using EPiServer.Web.Routing;

namespace Forte.EpiContentUsage.Api.Services;

public class ContentUsageService
{
    private readonly IContentModelUsage _contentModelUsage;
    private readonly IContentSoftLinkRepository _contentSoftLinkRepository;
    private readonly IUrlResolver _urlResolver;

    public ContentUsageService(IUrlResolver urlResolver, IContentSoftLinkRepository contentSoftLinkRepository,
        IContentModelUsage contentModelUsage)
    {
        _urlResolver = urlResolver;
        _contentSoftLinkRepository = contentSoftLinkRepository;
        _contentModelUsage = contentModelUsage;
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
        var latestVersionContentLink = contentUsage.ContentLink.ToReferenceWithoutVersion();

        return PageEditing.GetEditUrl(latestVersionContentLink);
    }

    public IEnumerable<ContentUsage> GetContentUsages(ContentType contentType)
    {
        var contentUsages = _contentModelUsage.ListContentOfContentType(contentType);

        var contentUsageLatestVersions = contentUsages.GroupBy(u => new { u.ContentLink.ID, u.LanguageBranch })
            .Select(v => v.MaxBy(u => u.ContentLink.WorkID));

        return contentUsageLatestVersions;
    }
}