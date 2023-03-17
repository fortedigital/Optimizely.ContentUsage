using System;
using System.Linq;
using EPiServer.Shell.Modules;
using Forte.EpiContentUsage.Api.Features.ContentType;
using Forte.EpiContentUsage.Api.Features.ContentUsage;
using Forte.EpiContentUsage.Api.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Forte.EpiContentUsage.Initialization;

public static class ServiceCollectionExtensions
{
    public static void AddEpiContentUsage(this IServiceCollection services)
    {
        services.AddTransient<ContentTypeBaseService>();
        services.AddTransient<ContentTypeService>();
        services.AddTransient<ContentUsageService>();

        services.AddTransient<ContentTypeMapper>();
        
        services.AddTransient<ContentTypeSorter>();
        services.AddTransient<ContentUsageSorter>();

        services.AddTransient<IPathsResolver, DefaultPathsResolver>();

        services.Configure<ProtectedModuleOptions>(options =>
        {
            var assemblyName = typeof(ServiceCollectionExtensions).Assembly.GetName().Name;

            if (options.Items.Any(i => i.Name.Equals(assemblyName, StringComparison.OrdinalIgnoreCase)))
                return;

            options.Items.Add(new ModuleDetails { Name = assemblyName });
        });
    }

    public static void AddEpiContentUsageDevServer(this IServiceCollection services, string devServerBaseUrl)
    {
        services.AddTransient<IPathsResolver>(_ => new DevServerPathsResolver(devServerBaseUrl));
    }
}