using EpiserverContentUsage.Api.Features.ContentType;
using EpiserverContentUsage.Api.Features.ContentUsage;
using EpiserverContentUsage.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EpiserverContentUsage.Controllers;

public class MainViewController : Controller
{
    [Authorize(Roles = "CmsAdmins")]
    [HttpGet]
    public IActionResult Index()
    {
        var viewModel = new MainViewViewModel(Url.RouteUrl(ContentTypeController.GetContentTypesRouteName),
            Url.RouteUrl(ContentUsageController.GetContentUsagesRouteName));

        return View(viewModel);
    }
}