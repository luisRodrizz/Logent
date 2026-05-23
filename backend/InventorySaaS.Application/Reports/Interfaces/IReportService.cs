using InventorySaaS.Application.Reports.DTOs;

namespace InventorySaaS.Application.Reports.Interfaces;

public interface IReportService
{
    Task<IReadOnlyList<StockSummaryResponse>> GetStockSummaryAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LowStockResponse>> GetLowStockAsync(
        CancellationToken cancellationToken = default);

    Task<MovementsSummaryResponse> GetMovementsSummaryAsync(
        CancellationToken cancellationToken = default);

    Task<KardexSummaryResponse> GetKardexSummaryAsync(
        CancellationToken cancellationToken = default);
}
