using InventorySaaS.Application.Kardex.DTOs;
using InventorySaaS.Application.Kardex.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Almacenero,Consulta")]
[Route("api/kardex")]
public class KardexController(IKardexService kardexService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<KardexEntryResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var entries = await kardexService.GetAllAsync(cancellationToken);

        return Ok(entries);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<KardexEntryResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var entry = await kardexService.GetByIdAsync(id, cancellationToken);

        return entry is null ? NotFound() : Ok(entry);
    }

    [HttpGet("by-product/{productId:guid}")]
    public async Task<ActionResult<IReadOnlyList<KardexEntryResponse>>> GetByProduct(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var entries = await kardexService.GetByProductAsync(productId, cancellationToken);

        return Ok(entries);
    }

    [HttpGet("by-warehouse/{warehouseId:guid}")]
    public async Task<ActionResult<IReadOnlyList<KardexEntryResponse>>> GetByWarehouse(
        Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var entries = await kardexService.GetByWarehouseAsync(warehouseId, cancellationToken);

        return Ok(entries);
    }

    [HttpGet("by-product/{productId:guid}/warehouse/{warehouseId:guid}")]
    public async Task<ActionResult<IReadOnlyList<KardexEntryResponse>>> GetByProductAndWarehouse(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var entries = await kardexService.GetByProductAndWarehouseAsync(
            productId,
            warehouseId,
            cancellationToken);

        return Ok(entries);
    }
}
