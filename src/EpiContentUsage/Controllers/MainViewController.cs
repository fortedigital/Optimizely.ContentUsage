using EPiServer.Shell.Modules;
using Forte.EpiContentUsage.Api.Features.ContentType;
using Forte.EpiContentUsage.Api.Features.ContentUsage;
using Forte.EpiContentUsage.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Forte.EpiContentUsage.Controllers;

public class MainViewController : Controller
{
    private readonly ModuleTable _modules;

    public MainViewController(ModuleTable modules) => _modules = modules;

    [Authorize(Roles = "CmsAdmins")]
    [HttpGet]
    public IActionResult Index()
    {
        _modules.TryGetModule(GetType().Assembly, out var shellModule);
        var moduleBaseUrl = shellModule.ResourceBasePath;

        var viewModel = new MainViewViewModel(
            moduleBaseUrl,
            Url.RouteUrl(ContentTypeController.GetContentTypeRouteName),
            Url.RouteUrl(ContentTypeController.GetContentTypesRouteName),
            Url.RouteUrl(ContentUsageController.GetContentUsagesRouteName)
        );

        return View(viewModel);
    }
}