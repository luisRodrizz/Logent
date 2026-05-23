using InventorySaaS.Application.Dashboard.DTOs;
using InventorySaaS.Application.Dashboard.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Almacenero,Consulta")]
[Route("api/dashboard")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryResponse>> GetSummary(CancellationToken cancellationToken)
    {
        var summary = await dashboardService.GetSummaryAsync(cancellationToken);

        return Ok(summary);
    }

    [HttpGet("stock-overview")]
    public async Task<ActionResult<IReadOnlyList<StockOverviewItemResponse>>> GetStockOverview(
        CancellationToken cancellationToken)
    {
        var stockOverview = await dashboardService.GetStockOverviewAsync(cancellationToken);

        return Ok(stockOverview);
    }

    [HttpGet("recent-movements")]
    public async Task<ActionResult<IReadOnlyList<RecentMovementResponse>>> GetRecentMovements(
        CancellationToken cancellationToken)
    {
        var recentMovements = await dashboardService.GetRecentMovementsAsync(cancellationToken);

        return Ok(recentMovements);
    }

    [HttpGet("low-stock-alerts")]
    public async Task<ActionResult<IReadOnlyList<LowStockAlertResponse>>> GetLowStockAlerts(
        CancellationToken cancellationToken)
    {
        var alerts = await dashboardService.GetLowStockAlertsAsync(cancellationToken);

        return Ok(alerts);
    }
}
