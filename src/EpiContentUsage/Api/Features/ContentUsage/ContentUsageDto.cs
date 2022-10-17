using System;
using System.Collections.Generic;
using Reinforced.Typings.Attributes;

namespace Forte.EpiContentUsage.Api.Features.ContentUsage;

[TsInterface]
public class ContentUsageDto
{
    public int Id { get; set; }
    public Guid ContentTypeGuid { get; set; }
    public string Name { get; set; }
    public string LanguageBranch{ get; set; }
    public IEnumerable<string> PageUrls { get; set; }
    public string EditUrl { get; set; }
}