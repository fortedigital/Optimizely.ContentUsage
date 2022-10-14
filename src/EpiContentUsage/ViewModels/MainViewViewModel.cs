using Reinforced.Typings.Attributes;

namespace EpiContentUsage.ViewModels;

public class MainViewViewModel
{
    public MainViewViewModel(string moduleBaseUrl, string contentTypeEndpointUrl, string contentTypesEndpointUrl, string contentUsagesEndpointUrl) =>
        FrontendAppModel =
            new AppModel
            {
                ModuleBaseUrl = moduleBaseUrl,
                ContentTypeEndpointUrl = contentTypeEndpointUrl,
                ContentTypesEndpointUrl = contentTypesEndpointUrl,
                ContentUsagesEndpointUrl = contentUsagesEndpointUrl
            };

    public AppModel FrontendAppModel { get; set; }
}

[TsInterface]
public class AppModel
{
    public string ModuleBaseUrl { get; set; }
    public string ContentTypeEndpointUrl { get; set; }
    public string ContentTypesEndpointUrl { get; set; }
    public string ContentUsagesEndpointUrl { get; set; }
}