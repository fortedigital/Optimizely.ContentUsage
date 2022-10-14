using System;
using System.Linq;
using EPiServer.Shell.Modules;
using Microsoft.Extensions.DependencyInjection;

namespace EpiContentUsage.Initialization;

public static class ServiceCollectionExtensions
{
    public static void AddEpiContentUsage(this IServiceCollection services)
    {
        services.Configure<ProtectedModuleOptions>(options =>
        {
            var assemblyName = typeof(ServiceCollectionExtensions).Assembly.GetName().Name;

            if (options.Items.Any(i => i.Name.Equals(assemblyName, StringComparison.OrdinalIgnoreCase)))
                return;

            options.Items.Add(new ModuleDetails { Name = assemblyName });
        });
    }
}