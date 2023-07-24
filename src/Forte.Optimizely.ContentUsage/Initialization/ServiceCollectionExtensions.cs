using System;
using System.Linq;
using EPiServer.Shell.Modules;
using Forte.Optimizely.ContentUsage.Api.Features.ContentType;
using Forte.Optimizely.ContentUsage.Api.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Forte.Optimizely.ContentUsage.Initialization;

public static class ServiceCollectionExtensions
{
    public static void AddContentUsage(this IServiceCollection services)
    {
        services.AddTransient<ContentTypeBaseService>();
        services.AddTransient<ContentTypeService>();
        services.AddTransient<ContentUsageService>();

        services.AddTransient<ContentTypeMapper>();

        services.AddTransient<IPathsResolver, DefaultPathsResolver>();

        services.Configure<ProtectedModuleOptions>(options =>
        {
            var assemblyName = typeof(ServiceCollectionExtensions).Assembly.GetName().Name;

            if (options.Items.Any(i => i.Name.Equals(assemblyName, StringComparison.OrdinalIgnoreCase)))
                return;

            options.Items.Add(new ModuleDetails { Name = assemblyName });
        });
    }

    public static void AddContentUsageDevServer(this IServiceCollection services, string devServerBaseUrl)
    {
        services.AddTransient<IPathsResolver>(_ => new DevServerPathsResolver(devServerBaseUrl));
    }
}