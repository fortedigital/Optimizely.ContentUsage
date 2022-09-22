using System;
using System.Collections.Generic;

namespace EpiserverContentUsage.Api.Features.ContentUsage;

public class ContentUsageDto
{
    public int Id { get; set; }
    public Guid ContentTypeGuid { get; set; }
    public string Name { get; set; }
    public string LanguageBrach{ get; set; }
    public IEnumerable<string> PageUrls { get; set; }
    public string EditUrl { get; set; }
}