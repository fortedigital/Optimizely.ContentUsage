using System;
using System.Collections.Generic;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentUsage;

[TsInterface]
public class ContentUsageDto
{
    public int Id { get; set; }
    public Guid ContentTypeGuid { get; set; }
    public string Name { get; set; }
    public string LanguageBranch{ get; set; }
    public IEnumerable<UsagePageDto> Pages { get; set; }
    public string EditUrl { get; set; }
}

[TsInterface]
public class UsagePageDto
{
    public string Url { get; set; }
    public string PageType { get; set; }
}