using EPiServer.Shell.Modules;
using Forte.Optimizely.ContentUsage.Api.Features.ContentTypeBase;
using Forte.Optimizely.ContentUsage.Api.Features.ContentType;
using Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;
using Forte.Optimizely.ContentUsage.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forte.Optimizely.ContentUsage.Controllers;

public class MainViewController : Controller
{
    private readonly ModuleTable _modules;

    public MainViewController(ModuleTable modules) => _modules = modules;

    [Authorize(Policy = "episerver:defaultshellmodule")]
    [HttpGet]
    public IActionResult Index()
    {
        _modules.TryGetModule(GetType().Assembly, out var shellModule);
        var moduleBaseUrl = shellModule.ResourceBasePath;

        var viewModel = new MainViewViewModel(
            moduleBaseUrl,
            Url.RouteUrl(ContentTypeBaseController.GetContentTypeBasesRouteName),
            Url.RouteUrl(ContentTypeController.GetContentTypeRouteName),
            Url.RouteUrl(ContentTypeController.GetContentTypesRouteName),
            Url.RouteUrl(ContentUsageController.GetContentUsagesRouteName)
        );

        return View(viewModel);
    }
}