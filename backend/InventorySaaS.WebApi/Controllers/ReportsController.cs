using InventorySaaS.Application.Reports.DTOs;
using InventorySaaS.Application.Reports.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Almacenero,Consulta")]
[Route("api/reports")]
public class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("stock-summary")]
    public async Task<ActionResult<IReadOnlyList<StockSummaryResponse>>> GetStockSummary(
        CancellationToken cancellationToken)
    {
        var report = await reportService.GetStockSummaryAsync(cancellationToken);

        return Ok(report);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IReadOnlyList<LowStockResponse>>> GetLowStock(
        CancellationToken cancellationToken)
    {
        var report = await reportService.GetLowStockAsync(cancellationToken);

        return Ok(report);
    }

    [HttpGet("movements-summary")]
    public async Task<ActionResult<MovementsSummaryResponse>> GetMovementsSummary(
        CancellationToken cancellationToken)
    {
        var report = await reportService.GetMovementsSummaryAsync(cancellationToken);

        return Ok(report);
    }

    [HttpGet("kardex-summary")]
    public async Task<ActionResult<KardexSummaryResponse>> GetKardexSummary(
        CancellationToken cancellationToken)
    {
        var report = await reportService.GetKardexSummaryAsync(cancellationToken);

        return Ok(report);
    }
}
