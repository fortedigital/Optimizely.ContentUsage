using System.Text.Json;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Forte.EpiContentUsage.Extensions;

public static class HtmlHelperExtensions
{
    public static IHtmlContent Serialized<T>(this IHtmlHelper htmlHelper, T input) => htmlHelper.Raw(
        JsonSerializer.Serialize(input,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
}