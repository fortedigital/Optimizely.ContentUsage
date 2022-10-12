using EpiContentUsage.Api.Features.ContentType;
using EpiContentUsage.Api.Features.ContentUsage;
using EpiContentUsage.ViewModels;
using EPiServer.Shell.Modules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EpiContentUsage.Controllers;

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