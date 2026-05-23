using InventorySaaS.Application.Dashboard.DTOs;
using InventorySaaS.Application.Dashboard.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Dashboard;

public class DashboardService(ApplicationDbContext context) : IDashboardService
{
    private const int DashboardItemsLimit = 10;

    public async Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var activeStockItems = GetActiveStockItemsQuery();

        return new DashboardSummaryResponse
        {
            TotalCategories = await context.Categories
                .AsNoTracking()
                .CountAsync(category => category.IsActive, cancellationToken),
            TotalSuppliers = await context.Suppliers
                .AsNoTracking()
                .CountAsync(supplier => supplier.IsActive, cancellationToken),
            TotalWarehouses = await context.Warehouses
                .AsNoTracking()
                .CountAsync(warehouse => warehouse.IsActive, cancellationToken),
            TotalProducts = await context.Products
                .AsNoTracking()
                .CountAsync(product => product.IsActive, cancellationToken),
            TotalStockItems = await activeStockItems.CountAsync(cancellationToken),
            LowStockItems = await activeStockItems
                .CountAsync(
                    stockItem => stockItem.Quantity <= stockItem.Product!.MinimumStock,
                    cancellationToken),
            TotalMovements = await context.Movements
                .AsNoTracking()
                .CountAsync(cancellationToken),
            TotalKardexEntries = await context.KardexEntries
                .AsNoTracking()
                .CountAsync(cancellationToken),
            TotalInventoryValue = await activeStockItems
                .SumAsync(
                    stockItem => (decimal?)(stockItem.Quantity * stockItem.Product!.PurchasePrice),
                    cancellationToken) ?? 0
        };
    }

    public async Task<IReadOnlyList<StockOverviewItemResponse>> GetStockOverviewAsync(
        CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .GroupBy(stockItem => new
            {
                stockItem.ProductId,
                stockItem.Product!.Code,
                stockItem.Product.Name,
                stockItem.Product.MinimumStock,
                stockItem.Product.PurchasePrice
            })
            .Select(group => new StockOverviewItemResponse
            {
                ProductId = group.Key.ProductId,
                ProductCode = group.Key.Code,
                ProductName = group.Key.Name,
                TotalQuantity = group.Sum(stockItem => stockItem.Quantity),
                MinimumStock = group.Key.MinimumStock,
                IsLowStock = group.Sum(stockItem => stockItem.Quantity) <= group.Key.MinimumStock,
                EstimatedValue = group.Sum(stockItem => stockItem.Quantity) * group.Key.PurchasePrice
            })
            .OrderBy(item => item.ProductName)
            .Take(DashboardItemsLimit)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RecentMovementResponse>> GetRecentMovementsAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.Movements
            .AsNoTracking()
            .Include(movement => movement.WarehouseOrigin)
            .Include(movement => movement.WarehouseDestination)
            .Include(movement => movement.Details)
            .OrderByDescending(movement => movement.Date)
            .Take(DashboardItemsLimit)
            .Select(movement => new RecentMovementResponse
            {
                Id = movement.Id,
                Type = movement.Type,
                Date = movement.Date,
                WarehouseOriginName = movement.WarehouseOrigin != null ? movement.WarehouseOrigin.Name : null,
                WarehouseDestinationName = movement.WarehouseDestination != null ? movement.WarehouseDestination.Name : null,
                Observation = movement.Observation,
                CreatedByUserId = movement.CreatedByUserId ?? string.Empty,
                TotalItems = movement.Details.Count,
                TotalQuantity = movement.Details.Sum(detail => detail.Quantity)
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LowStockAlertResponse>> GetLowStockAlertsAsync(
        CancellationToken cancellationToken = default)
    {
        return await GetActiveStockItemsQuery()
            .Where(stockItem => stockItem.Quantity <= stockItem.Product!.MinimumStock)
            .Select(stockItem => new LowStockAlertResponse
            {
                ProductId = stockItem.ProductId,
                ProductCode = stockItem.Product!.Code,
                ProductName = stockItem.Product.Name,
                WarehouseId = stockItem.WarehouseId,
                WarehouseName = stockItem.Warehouse!.Name,
                Quantity = stockItem.Quantity,
                MinimumStock = stockItem.Product.MinimumStock,
                MissingQuantity = stockItem.Product.MinimumStock > stockItem.Quantity
                    ? stockItem.Product.MinimumStock - stockItem.Quantity
                    : 0
            })
            .OrderByDescending(item => item.MissingQuantity)
            .ThenBy(item => item.ProductName)
            .Take(DashboardItemsLimit)
            .ToListAsync(cancellationToken);
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
}
