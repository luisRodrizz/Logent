using InventorySaaS.Application.StockItems.DTOs;
using InventorySaaS.Application.StockItems.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.StockItems;

public class StockItemService(ApplicationDbContext context) : IStockItemService
{
    public async Task<IReadOnlyList<StockItemResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .OrderBy(stockItem => stockItem.Product!.Name)
            .ThenBy(stockItem => stockItem.Warehouse!.Name)
            .Select(stockItem => MapToResponse(stockItem))
            .ToListAsync(cancellationToken);
    }

    public async Task<StockItemResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .Where(stockItem => stockItem.Id == id)
            .Select(stockItem => MapToResponse(stockItem))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockItemResponse>> GetByProductAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .Where(stockItem => stockItem.ProductId == productId)
            .OrderBy(stockItem => stockItem.Warehouse!.Name)
            .Select(stockItem => MapToResponse(stockItem))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockItemResponse>> GetByWarehouseAsync(
        Guid warehouseId,
        CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .Where(stockItem => stockItem.WarehouseId == warehouseId)
            .OrderBy(stockItem => stockItem.Product!.Name)
            .Select(stockItem => MapToResponse(stockItem))
            .ToListAsync(cancellationToken);
    }

    public async Task<StockItemResponse?> GetByProductAndWarehouseAsync(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .Where(stockItem => stockItem.ProductId == productId && stockItem.WarehouseId == warehouseId)
            .Select(stockItem => MapToResponse(stockItem))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private IQueryable<StockItem> GetActiveStockItemsQuery()
    {
        return context.StockItems
            .AsNoTracking()
            .Include(stockItem => stockItem.Product)
            .Include(stockItem => stockItem.Warehouse)
            .Where(
                stockItem =>
                    stockItem.Product != null
                    && stockItem.Product.IsActive
                    && stockItem.Warehouse != null
                    && stockItem.Warehouse.IsActive);
    }

    private static StockItemResponse MapToResponse(StockItem stockItem)
    {
        return new StockItemResponse
        {
            Id = stockItem.Id,
            ProductId = stockItem.ProductId,
            ProductCode = stockItem.Product?.Code ?? string.Empty,
            ProductName = stockItem.Product?.Name ?? string.Empty,
            WarehouseId = stockItem.WarehouseId,
            WarehouseName = stockItem.Warehouse?.Name ?? string.Empty,
            Quantity = stockItem.Quantity,
            UpdatedAt = stockItem.UpdatedAt
        };
    }
}
