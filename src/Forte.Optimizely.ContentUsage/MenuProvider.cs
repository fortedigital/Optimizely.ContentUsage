using System.Collections.Generic;
using EPiServer.Shell;
using EPiServer.Shell.Navigation;

namespace Forte.Optimizely.ContentUsage
{
    [MenuProvider]
    public class MenuProvider : IMenuProvider
    {
        public IEnumerable<MenuItem> GetMenuItems()
        {
            var url = Paths.ToResource(GetType(), "MainView");
            var urlMenuItem1 = new UrlMenuItem("Content Usage", "/global/cms/fortecontentusage", url);

            return new List<MenuItem>(1) { urlMenuItem1 };
        }
    }
}

