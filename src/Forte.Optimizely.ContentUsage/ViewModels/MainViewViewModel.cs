using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.ViewModels;

public class MainViewViewModel
{
    public MainViewViewModel(string moduleBaseUrl, string contentTypeBasesEndpointUrl, string contentTypeEndpointUrl,
        string contentTypesEndpointUrl, string contentUsagesEndpointUrl) =>
        FrontendAppModel =
            new AppModel
            {
                ModuleBaseUrl = moduleBaseUrl,
                ContentTypeBasesEndpointUrl = contentTypeBasesEndpointUrl,
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
    public string ContentTypeBasesEndpointUrl { get; set; }
    public string ContentTypeEndpointUrl { get; set; }
    public string ContentTypesEndpointUrl { get; set; }
    public string ContentUsagesEndpointUrl { get; set; }
}