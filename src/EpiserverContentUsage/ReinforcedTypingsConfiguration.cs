using Reinforced.Typings.Attributes;
using Reinforced.Typings.Fluent;
using System.Linq;
using System.Reflection;

namespace EpiserverContentUsage;

public static class ReinforcedTypingsConfiguration
{
    public static void Configure(ConfigurationBuilder builder)
    {
        var tsInterfaces = typeof(ReinforcedTypingsConfiguration).Assembly.GetTypes()
            .Where(type => type.GetCustomAttribute<TsInterfaceAttribute>() != null);

        builder.ExportAsInterfaces(tsInterfaces, interfaceExportBuilder => interfaceExportBuilder.AutoI(false));
        builder.Global(config => config.CamelCaseForProperties().AutoOptionalProperties().UseModules());
    }
}