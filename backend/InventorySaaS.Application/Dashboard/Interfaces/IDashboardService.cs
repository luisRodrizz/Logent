using InventorySaaS.Application.Dashboard.DTOs;

namespace InventorySaaS.Application.Dashboard.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StockOverviewItemResponse>> GetStockOverviewAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecentMovementResponse>> GetRecentMovementsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LowStockAlertResponse>> GetLowStockAlertsAsync(
        CancellationToken cancellationToken = default);
}
