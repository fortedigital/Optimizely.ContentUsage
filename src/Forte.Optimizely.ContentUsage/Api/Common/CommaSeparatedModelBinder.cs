using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Forte.Optimizely.ContentUsage.Api.Common;

public class CommaSeparatedModelBinder : IModelBinder
{
    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var modelName = bindingContext.ModelName;
        var attemptedValue =
            bindingContext.ValueProvider.GetValue(modelName).FirstValue;

        if (bindingContext.ModelMetadata.IsNullableValueType
            && string.IsNullOrWhiteSpace(attemptedValue))
            return;

        try
        {
            bindingContext.Result = ModelBindingResult.Success(attemptedValue?.Split(','));
        }
        catch (FormatException e)
        {
            bindingContext.Result = ModelBindingResult.Failed();
            bindingContext.ModelState.AddModelError(modelName, e.Message);
        }

        await Task.CompletedTask;
    }
}