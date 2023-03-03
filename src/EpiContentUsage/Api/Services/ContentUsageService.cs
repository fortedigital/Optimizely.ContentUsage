using System.Collections.Generic;
using System.Linq;
using EPiServer;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Editor;
using EPiServer.Filters;
using EPiServer.Web.Routing;

namespace Forte.EpiContentUsage.Api.Services;

public class ContentUsageService
{
    private readonly IContentModelUsage _contentModelUsage;
    private readonly IContentLoader _contentLoader;
    private readonly IPublishedStateAssessor _publishedStateAssessor;
    private readonly IContentSoftLinkRepository _contentSoftLinkRepository;
    private readonly IUrlResolver _urlResolver;

    public ContentUsageService(IUrlResolver urlResolver, IContentSoftLinkRepository contentSoftLinkRepository,
        IContentModelUsage contentModelUsage, IContentLoader contentLoader, IPublishedStateAssessor publishedStateAssessor)
    {
        _urlResolver = urlResolver;
        _contentSoftLinkRepository = contentSoftLinkRepository;
        _contentModelUsage = contentModelUsage;
        _contentLoader = contentLoader;
        _publishedStateAssessor = publishedStateAssessor;
    }

    public IEnumerable<string> GetPageUrls(ContentReference contentLink)
    {
        var url = _urlResolver.GetUrl(contentLink);

        if (!string.IsNullOrEmpty(url))
        {
            return CheckIsPublished(contentLink) ? new[] { url } : new string[] { };
        }
        
        var pageLinks = _contentSoftLinkRepository.Load(contentLink, true)
            .Where(softLink => softLink.SoftLinkType == ReferenceType.PageLinkReference)
            .Select(softLink => softLink.OwnerContentLink)
            .Where(ownerContentLink => ownerContentLink != null && CheckIsPublished(ownerContentLink));
        
        return pageLinks.Select(pageLink => _urlResolver.GetUrl(pageLink));
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

    private bool CheckIsPublished(ContentReference contentLink)
    {
        var content = _contentLoader.Get<IContent>(contentLink);
        
        return _publishedStateAssessor.IsPublished(content);
    }
}