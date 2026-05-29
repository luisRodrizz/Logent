using InventorySaaS.Application.StockItems.DTOs;
using InventorySaaS.Application.StockItems.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Almacenero,Consulta")]
[Route("api/stock-items")]
public class StockItemsController(IStockItemService stockItemService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StockItemResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var stockItems = await stockItemService.GetAllAsync(cancellationToken);

        return Ok(stockItems);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StockItemResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var stockItem = await stockItemService.GetByIdAsync(id, cancellationToken);

        return stockItem is null
            ? this.ApiNotFound("Stock item not found.", "No stock item was found with the provided id.")
            : Ok(stockItem);
    }

    [HttpGet("by-product/{productId:guid}")]
    public async Task<ActionResult<IReadOnlyList<StockItemResponse>>> GetByProduct(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var stockItems = await stockItemService.GetByProductAsync(productId, cancellationToken);

        return Ok(stockItems);
    }

    [HttpGet("by-warehouse/{warehouseId:guid}")]
    public async Task<ActionResult<IReadOnlyList<StockItemResponse>>> GetByWarehouse(
        Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var stockItems = await stockItemService.GetByWarehouseAsync(warehouseId, cancellationToken);

        return Ok(stockItems);
    }

    [HttpGet("by-product/{productId:guid}/warehouse/{warehouseId:guid}")]
    public async Task<ActionResult<StockItemResponse>> GetByProductAndWarehouse(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken)
    {
        var stockItem = await stockItemService.GetByProductAndWarehouseAsync(
            productId,
            warehouseId,
            cancellationToken);

        return stockItem is null
            ? this.ApiNotFound("Stock item not found.", "No stock item was found for the provided product and warehouse.")
            : Ok(stockItem);
    }
}
