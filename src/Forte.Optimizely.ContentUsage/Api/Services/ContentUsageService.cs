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

    public IEnumerable<UsagePage> GetUsagePages(EPiServerContentUsage contentUsage)
    {
        var usagePages = SearchForUsagePages(contentUsage.ContentLink, contentUsage.LanguageBranch);

        return usagePages;
    }

    private IEnumerable<UsagePage> SearchForUsagePages(ContentReference contentLink, string languageBranch)
    {
        var url = _urlResolver.GetUrl(contentLink, languageBranch);

        if (!string.IsNullOrEmpty(url))
        {
            _contentLoader.TryGet<PageData>(contentLink, out var page);

            if (page == null || !CheckIsPublished(page))
                return new UsagePage[] { };

            return new[] { new UsagePage { Url = url, Page = page } };
        }

        var softLinks = _contentSoftLinkRepository.Load(contentLink, true);
        var pageLinks = softLinks
            .Where(softLink => softLink.SoftLinkType == ReferenceType.PageLinkReference)
            .Select(softLink => softLink.OwnerContentLink)
            .Where(ownerContentLink => ownerContentLink != null && CheckIsPublished(ownerContentLink));

        var pageUrls = pageLinks.SelectMany(pageLink => SearchForUsagePages(pageLink, languageBranch));

        return pageUrls;
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

        return CheckIsPublished(content);
    }

    private bool CheckIsPublished(IContent content)
    {
        return _publishedStateAssessor.IsPublished(content);
    }
}

public class UsagePage
{
    public string Url { get; set; }
    public PageData Page { get; set; }
}