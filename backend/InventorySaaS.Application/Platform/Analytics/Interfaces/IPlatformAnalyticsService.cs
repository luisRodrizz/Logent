using InventorySaaS.Application.Platform.Analytics.DTOs;

namespace InventorySaaS.Application.Platform.Analytics.Interfaces;

public interface IPlatformAnalyticsService
{
    Task<PlatformAnalyticsSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);
}
