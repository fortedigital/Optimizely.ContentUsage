using System.Linq;
using System.Reflection;
using Forte.EpiContentUsage.Utils.TSGenerating;
using Reinforced.Typings.Attributes;
using Reinforced.Typings.Fluent;

namespace Forte.EpiContentUsage;

public static class ReinforcedTypingsConfiguration
{
    public static void Configure(ConfigurationBuilder builder)
    {
        var tsInterfaces = typeof(ReinforcedTypingsConfiguration).Assembly.GetTypes()
            .Where(type => type.GetCustomAttribute<TsInterfaceAttribute>() != null);

        var tsEnums = typeof(ReinforcedTypingsConfiguration).Assembly.GetTypes()
            .Where(type => type.GetCustomAttribute<TsEnumAttribute>() != null);

        
        builder.ExportAsInterfaces(tsInterfaces, interfaceExportBuilder => interfaceExportBuilder.AutoI(false));
        builder.Global(config => config.CamelCaseForProperties().AutoOptionalProperties().UseModules());
        builder.ExportAsEnums(tsEnums, exportBuilder => exportBuilder.WithCodeGenerator<CamelcaseEnumStringGenerator>());
    }
}