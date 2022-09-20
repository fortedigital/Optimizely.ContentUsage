using Reinforced.Typings.Attributes;

namespace EpiserverContentUsage.ViewModels;

public class MainViewViewModel
{
    public MainViewViewModel(string getContentTypesEndpointUrl, string getContentUsagesEndpointUrl) =>
        FrontendAppModel =
            new AppModel
            {
                GetContentTypesEndpointUrl = getContentTypesEndpointUrl,
                GetContentUsagesEndpointUrl = getContentUsagesEndpointUrl
            };

    public AppModel FrontendAppModel { get; set; }
}

[TsInterface]
public class AppModel
{
    public string GetContentTypesEndpointUrl { get; set; }
    public string GetContentUsagesEndpointUrl { get; set; }
}