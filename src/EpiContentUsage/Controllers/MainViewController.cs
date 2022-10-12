using EPiServer.Shell.Modules;
using EpiserverContentUsage.Api.Features.ContentType;
using EpiserverContentUsage.Api.Features.ContentUsage;
using EpiserverContentUsage.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EpiserverContentUsage.Controllers;

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
            Url.RouteUrl(ContentTypeController.GetContentTypesRouteName),
            Url.RouteUrl(ContentUsageController.GetContentUsagesRouteName)
        );

        return View(viewModel);
    }
}