using InventorySaaS.Application.Platform.Dashboard.DTOs;

namespace InventorySaaS.Application.Platform.Dashboard.Interfaces;

public interface IPlatformDashboardService
{
    Task<PlatformDashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);
}
