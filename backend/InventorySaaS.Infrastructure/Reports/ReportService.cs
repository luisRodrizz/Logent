using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Reports.DTOs;
using InventorySaaS.Application.Reports.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Reports;

public class ReportService(ApplicationDbContext context, ICurrentUserContext currentUserContext) : IReportService
{
    public async Task<IReadOnlyList<StockSummaryResponse>> GetStockSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .OrderBy(stockItem => stockItem.Product!.Name)
            .ThenBy(stockItem => stockItem.Warehouse!.Name)
            .Select(stockItem => new StockSummaryResponse
            {
                ProductId = stockItem.ProductId,
                ProductCode = stockItem.Product!.Code,
                ProductName = stockItem.Product.Name,
                WarehouseId = stockItem.WarehouseId,
                WarehouseName = stockItem.Warehouse!.Name,
                Quantity = stockItem.Quantity,
                MinimumStock = stockItem.Product.MinimumStock,
                IsLowStock = stockItem.Quantity <= stockItem.Product.MinimumStock,
                EstimatedStockValue = stockItem.Quantity * stockItem.Product.PurchasePrice
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LowStockResponse>> GetLowStockAsync(
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetActiveStockItemsQuery(companyId)
            .Where(stockItem => stockItem.Quantity <= stockItem.Product!.MinimumStock)
            .OrderBy(stockItem => stockItem.Product!.Name)
            .ThenBy(stockItem => stockItem.Warehouse!.Name)
            .Select(stockItem => new LowStockResponse
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
            .ToListAsync(cancellationToken);
    }

    public async Task<MovementsSummaryResponse> GetMovementsSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var movements = context.Movements
            .AsNoTracking()
            .Where(movement => movement.CompanyId == companyId);
        var movementDetails = context.MovementDetails
            .AsNoTracking()
            .Where(detail => detail.Movement != null && detail.Movement.CompanyId == companyId);

        return new MovementsSummaryResponse
        {
            TotalMovements = await movements.CountAsync(cancellationToken),
            TotalEntries = await movements.CountAsync(
                movement => movement.Type == MovementType.Entry,
                cancellationToken),
            TotalExits = await movements.CountAsync(
                movement => movement.Type == MovementType.Exit,
                cancellationToken),
            TotalTransfers = await movements.CountAsync(
                movement => movement.Type == MovementType.Transfer,
                cancellationToken),
            TotalMovementDetails = await movementDetails.CountAsync(cancellationToken),
            TotalUnitsMoved = await movementDetails.SumAsync(
                detail => (int?)detail.Quantity,
                cancellationToken) ?? 0
        };
    }

    public async Task<KardexSummaryResponse> GetKardexSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var kardexEntries = context.KardexEntries
            .AsNoTracking()
            .Where(entry => entry.CompanyId == companyId);

        return new KardexSummaryResponse
        {
            TotalEntries = await kardexEntries.CountAsync(cancellationToken),
            TotalEntryUnits = await kardexEntries.SumAsync(
                entry => (int?)entry.QuantityIn,
                cancellationToken) ?? 0,
            TotalExitUnits = await kardexEntries.SumAsync(
                entry => (int?)entry.QuantityOut,
                cancellationToken) ?? 0,
            TotalInventoryValue = await GetActiveStockItemsQuery(companyId)
                .SumAsync(
                    stockItem => (decimal?)(stockItem.Quantity * stockItem.Product!.PurchasePrice),
                    cancellationToken) ?? 0,
            LastMovementDate = await kardexEntries
                .OrderByDescending(entry => entry.Date)
                .Select(entry => (DateTime?)entry.Date)
                .FirstOrDefaultAsync(cancellationToken)
        };
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
}
