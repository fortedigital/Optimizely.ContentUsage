using System.Collections.Generic;
using Reinforced.Typings.Attributes;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

[TsInterface]
public class ContentTypesResponse
{
    public int TotalPages { get; set; }
    public IEnumerable<ContentTypeDto> ContentTypes { get; set; }
}