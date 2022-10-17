using System.Collections.Generic;
using EPiServer.Shell;
using EPiServer.Shell.Navigation;

namespace Forte.EpiContentUsage
{
    [MenuProvider]
    public class MenuProvider : IMenuProvider
    {
        public IEnumerable<MenuItem> GetMenuItems()
        {
            var url = Paths.ToResource(GetType(), "MainView");
            var urlMenuItem1 = new UrlMenuItem("Content Usage", "/global/cms/admin/csp", url); 
            urlMenuItem1.IsAvailable = context => true;
            urlMenuItem1.SortIndex = 100;

            return new List<MenuItem>(1) { urlMenuItem1 };
        }
    }
}

