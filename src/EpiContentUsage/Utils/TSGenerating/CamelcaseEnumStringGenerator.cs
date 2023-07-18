using System;
using Reinforced.Typings;
using Reinforced.Typings.Ast;
using Reinforced.Typings.Generators;

namespace Forte.EpiContentUsage.Utils.TSGenerating;

public class CamelcaseEnumStringGenerator : EnumGenerator
{
    public override RtEnum GenerateNode(Type element, RtEnum result, TypeResolver resolver)
    {
        result = base.GenerateNode(element, result, resolver);

        foreach (var enumValue in result.Values)
        {
            var value = enumValue.EnumValue;
            enumValue.EnumValue = $"\"{char.ToLower(value[1])}{value.Substring(2)}";
        }

        return result;
    }
}