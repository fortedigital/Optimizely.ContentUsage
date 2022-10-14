using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Forte.EpiContentUsage.Api.Features.ContentUsage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Forte.EpiContentUsage.Api.Extensions;

public static class WebApplicationBuilderExtensions
{
    public static void AddEpiContentUsageSwagger(this IServiceCollection services)
    {
        services.AddControllers().AddApplicationPart(typeof(ContentUsageController).Assembly);
        services.AddEndpointsApiExplorer();
        services.ConfigureOptions<MyConfigureOptions>();
        services.AddSwaggerGen(options => options.SchemaFilter<EnumSchemaFilter>());
    }
}

internal class ApiExplorerEpiContentUsageOnlyConvention : IActionModelConvention
{
    private static readonly Lazy<IEnumerable<Type>> _contentUsageControllers = new(() =>
        typeof(ApiExplorerEpiContentUsageOnlyConvention).Assembly.GetTypes()
            .Where(type => type.GetCustomAttribute<ApiControllerAttribute>() != null));

    public void Apply(ActionModel action)
    {
        var controllerType = action.Controller.ControllerType;

        action.ApiExplorer.IsVisible = _contentUsageControllers.Value.Contains(controllerType);
    }
}

internal class MyConfigureOptions : IConfigureOptions<MvcOptions>
{
    public void Configure(MvcOptions options)
    {
        options.Conventions.Add(new ApiExplorerEpiContentUsageOnlyConvention());
    }
}

internal class EnumSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema model, SchemaFilterContext context)
    {
        if (!context.Type.IsEnum) return;
        
        model.Type = "string";
        model.Enum.Clear();
        Enum.GetNames(context.Type).ToList().ForEach(name => model.Enum.Add(new OpenApiString(name.ToLower())));
    }
}