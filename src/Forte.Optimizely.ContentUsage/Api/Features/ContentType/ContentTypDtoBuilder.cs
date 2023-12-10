using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EPiServer.DataAbstraction;

namespace Forte.Optimizely.ContentUsage.Api.Features.ContentType;

public class ContentTypeDtoBuilder
{
    private readonly ContentTypeUsagesRepository _contentTypeUsagesRepository;

    public ContentTypeDtoBuilder(ContentTypeUsagesRepository contentTypeUsagesRepository)
    {
        _contentTypeUsagesRepository = contentTypeUsagesRepository;
    }

    public async Task<ContentTypeDto> Build(EPiServer.DataAbstraction.ContentType contentType,
        CancellationToken cancellationToken)
    {
        var dto = new ContentTypeDto
        {
            ID = contentType.ID,
            DisplayName = contentType.DisplayName,
            Name = contentType.Name,
            Guid = contentType.GUID,
            Type = contentType.Base.ToString(),
            Statistics = new UsageStatisticDto[] { }
        };

        if (contentType is not BlockType blockType)
            return dto;

        var usagePages = await _contentTypeUsagesRepository.GetUsagePages(blockType, cancellationToken);

        dto.Statistics = usagePages
            .GroupBy(usagePage => usagePage.PageType)
            .Select(group => new UsageStatisticDto { PageTypeName = group.Key, UsageCount = group.Count() })
            .OrderByDescending(statistic => statistic.UsageCount).ToArray();

        return dto;
    }
}