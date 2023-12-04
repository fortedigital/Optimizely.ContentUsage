using System.Collections.Generic;
using System.Linq;
using EPiServer;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Editor;
using EPiServer.Web.Routing;

namespace Forte.Optimizely.ContentUsage.Api.Services;

using EPiServerContentUsage = EPiServer.DataAbstraction.ContentUsage;

public class ContentUsageService
{
    private readonly IContentLoader _contentLoader;
    private readonly IContentModelUsage _contentModelUsage;
    private readonly IContentSoftLinkRepository _contentSoftLinkRepository;
    private readonly IPublishedStateAssessor _publishedStateAssessor;
    private readonly IUrlResolver _urlResolver;

    public ContentUsageService(IUrlResolver urlResolver, IContentSoftLinkRepository contentSoftLinkRepository,
        IContentModelUsage contentModelUsage, IContentLoader contentLoader,
        IPublishedStateAssessor publishedStateAssessor)
    {
        _urlResolver = urlResolver;
        _contentSoftLinkRepository = contentSoftLinkRepository;
        _contentModelUsage = contentModelUsage;
        _contentLoader = contentLoader;
        _publishedStateAssessor = publishedStateAssessor;
    }

    public IEnumerable<string> GetPageUrls(EPiServerContentUsage contentUsage)
    {
        var contentLink = contentUsage.ContentLink;
     
        var pageUrls = SearchForPageUrls(contentLink, contentUsage.LanguageBranch);

        return pageUrls;
    }
    
    public IEnumerable<PageData> GetUsagePages(EPiServerContentUsage contentUsage)
    {
        var usagePageLinks = SearchUsagePages(contentUsage.ContentLink);

        var pages = usagePageLinks.Select(usagePageLink =>
        {
            _contentLoader.TryGet<PageData>(usagePageLink, out var page);
            return page;
        }).Where(page => page != null);
        
        return pages;
    }

    private IEnumerable<string> SearchForPageUrls(ContentReference contentLink, string languageBranch)
    {
        var url = _urlResolver.GetUrl(contentLink, languageBranch);

        if (!string.IsNullOrEmpty(url)) 
            return CheckIsPublished(contentLink) ? new[] { url } : new string[] { };

        var softLinks = _contentSoftLinkRepository.Load(contentLink, true);
        var pageLinks = softLinks
            .Where(softLink => softLink.SoftLinkType == ReferenceType.PageLinkReference)
            .Select(softLink => softLink.OwnerContentLink)
            .Where(ownerContentLink => ownerContentLink != null && CheckIsPublished(ownerContentLink));

        var pageUrls = pageLinks.SelectMany(pageLink => SearchForPageUrls(pageLink, languageBranch));
        
        return pageUrls;
    }

    private IEnumerable<ContentReference> SearchUsagePages(ContentReference contentLink)
    {
        var softLinks = _contentSoftLinkRepository.Load(contentLink, true);
        var pageLinks = softLinks
            .Where(softLink => softLink.SoftLinkType == ReferenceType.PageLinkReference)
            .Select(softLink => softLink.OwnerContentLink)
            .Where(ownerContentLink => ownerContentLink != null && CheckIsPublished(ownerContentLink));

        return pageLinks;
    } 

    public string GetEditUrl(EPiServerContentUsage contentUsage)
    {
        var latestVersionContentLink = contentUsage.ContentLink.ToReferenceWithoutVersion();

        return PageEditing.GetEditUrlForLanguage(latestVersionContentLink, contentUsage.LanguageBranch);
    }

    public IEnumerable<EPiServerContentUsage> GetContentUsages(ContentType contentType)
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