using System;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

[TsInterface]
public class ContentTypeDto
{
    public int ID { get; set; }
    public Guid Guid { get; set; }
    public string DisplayName { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public int UsageCount { get; set; }
}
