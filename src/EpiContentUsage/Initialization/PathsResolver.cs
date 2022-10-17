using System;
using EPiServer.Shell;

namespace Forte.EpiContentUsage.Initialization;

public interface IPathsResolver
{
    string ToClientResource(Type typeInModuleAssembly, string moduleRelativeClientResourcePath);
}

public class DefaultPathsResolver : IPathsResolver
{
    public string ToClientResource(Type typeInModuleAssembly, string moduleRelativeClientResourcePath)
    {
        return Paths.ToClientResource(typeInModuleAssembly, moduleRelativeClientResourcePath);
    }
}

public class DevServerPathsResolver : IPathsResolver
{
    private const string ClientResourcesRoot = "ClientResources/";

    private readonly string _devServerBaseUrl;

    public DevServerPathsResolver(string devServerBaseUrl)
    {
        _devServerBaseUrl = devServerBaseUrl;
    }

    public string ToClientResource(Type typeInModuleAssembly, string moduleRelativeClientResourcePath)
    {
        var isReplaced = TryReplaceAtStart(moduleRelativeClientResourcePath, ClientResourcesRoot, _devServerBaseUrl,
            out var devServerPath);

        if (!isReplaced)
            throw new InvalidOperationException($"Unable to replace '{ClientResourcesRoot}' segment");

        return devServerPath;
    }

    private static bool TryReplaceAtStart(string input, string oldValue, string newValue, out string output)
    {
        output = string.Empty;

        if (input.StartsWith(oldValue))
        {
            output = newValue + input.Remove(0, oldValue.Length);
            return true;
        }

        return false;
    }
}