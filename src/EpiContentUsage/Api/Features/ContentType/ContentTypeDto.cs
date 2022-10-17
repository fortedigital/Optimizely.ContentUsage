using System;
using Reinforced.Typings.Attributes;

namespace Forte.EpiContentUsage.Api.Features.ContentType;

[TsInterface]
public class ContentTypeDto
{
    public Guid Guid { get; set; }
    public string DisplayName { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public int UsageCount { get; set; }
}
