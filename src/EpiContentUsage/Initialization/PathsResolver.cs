using System;
using EPiServer.Framework.Web.Resources;
using EPiServer.ServiceLocation;
using EPiServer.Shell;

namespace Forte.EpiContentUsage.Initialization;

public static class PathsResolver
{
    public static string ToClientResource(Type typeInModuleAssembly, string moduleRelativeClientResourcePath)
    {
        var isDebug = ServiceLocator.Current.GetInstance<ClientResourceOptions>().Debug;

        if (isDebug) return "http://localhost:8080/react-app.js";

        return Paths.ToClientResource(typeInModuleAssembly, moduleRelativeClientResourcePath);
    }
}