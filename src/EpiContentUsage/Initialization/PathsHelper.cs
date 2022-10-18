using System;
using EPiServer.ServiceLocation;

namespace Forte.EpiContentUsage.Initialization;

public static class PathsHelper
{
    public static string ToClientResource(Type typeInModuleAssembly, string moduleRelativeClientResourcePath)
    {
        var pathsProvider = ServiceLocator.Current.GetInstance<IPathsResolver>();

        return pathsProvider.ToClientResource(typeInModuleAssembly, moduleRelativeClientResourcePath);
    }
}