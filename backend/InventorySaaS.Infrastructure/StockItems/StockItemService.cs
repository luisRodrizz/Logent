using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.StockItems.DTOs;
using InventorySaaS.Application.StockItems.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.StockItems;

public class StockItemService(ApplicationDbContext context, ICurrentUserContext currentUserContext) : IStockItemService
{
    public async Task<IReadOnlyList<StockItemResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .OrderBy(stockItem => stockItem.Product!.Name)
            .ThenBy(stockItem => stockItem.Warehouse!.Name)
            .Select(stockItem => MapToResponse(stockItem))
            .ToListAsync(cancellationToken);
    }

    public async Task<StockItemResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .Where(stockItem => stockItem.Id == id)
            .Select(stockItem => MapToResponse(stockItem))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockItemResponse>> GetByProductAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .Where(stockItem => stockItem.ProductId == productId && stockItem.Product!.CompanyId == companyId)
            .OrderBy(stockItem => stockItem.Warehouse!.Name)
            .Select(stockItem => MapToResponse(stockItem))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockItemResponse>> GetByWarehouseAsync(
        Guid warehouseId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .Where(stockItem => stockItem.WarehouseId == warehouseId && stockItem.Warehouse!.CompanyId == companyId)
            .OrderBy(stockItem => stockItem.Product!.Name)
            .Select(stockItem => MapToResponse(stockItem))
            .ToListAsync(cancellationToken);
    }

    public async Task<StockItemResponse?> GetByProductAndWarehouseAsync(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .Where(
                stockItem =>
                    stockItem.ProductId == productId
                    && stockItem.Product!.CompanyId == companyId
                    && stockItem.WarehouseId == warehouseId
                    && stockItem.Warehouse!.CompanyId == companyId)
            .Select(stockItem => MapToResponse(stockItem))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private IQueryable<StockItem> GetActiveStockItemsQuery(Guid companyId)
    {
        return context.StockItems
            .AsNoTracking()
            .Include(stockItem => stockItem.Product)
            .Include(stockItem => stockItem.Warehouse)
            .Where(
                stockItem =>
                    stockItem.CompanyId == companyId
                    && stockItem.Product != null
                    && stockItem.Product.CompanyId == companyId
                    && stockItem.Product.IsActive
                    && stockItem.Warehouse != null
                    && stockItem.Warehouse.CompanyId == companyId
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
