using InventorySaaS.Application.Kardex.DTOs;
using InventorySaaS.Application.Kardex.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Kardex;

public class KardexService(ApplicationDbContext context) : IKardexService
{
    public async Task<PagedResponse<KardexEntryResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = GetKardexEntriesQuery();
        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                entry =>
                    (entry.Product != null && entry.Product.Code.ToLower().Contains(search))
                    || (entry.Product != null && entry.Product.Name.ToLower().Contains(search))
                    || (entry.Warehouse != null && entry.Warehouse.Name.ToLower().Contains(search))
                    || (entry.Observation != null && entry.Observation.ToLower().Contains(search)));
        }

        return await query
            .OrderByDescending(entry => entry.Date)
            .Select(entry => MapToResponse(entry))
            .ToPagedResponseAsync(request, cancellationToken);
    }

    public async Task<KardexEntryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await GetKardexEntriesQuery()
            .Where(entry => entry.Id == id)
            .Select(entry => MapToResponse(entry))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<KardexEntryResponse>> GetByProductAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        return await GetKardexEntriesQuery()
            .Where(entry => entry.ProductId == productId)
            .OrderByDescending(entry => entry.Date)
            .Select(entry => MapToResponse(entry))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<KardexEntryResponse>> GetByWarehouseAsync(
        Guid warehouseId,
        CancellationToken cancellationToken = default)
    {
        return await GetKardexEntriesQuery()
            .Where(entry => entry.WarehouseId == warehouseId)
            .OrderByDescending(entry => entry.Date)
            .Select(entry => MapToResponse(entry))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<KardexEntryResponse>> GetByProductAndWarehouseAsync(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken = default)
    {
        return await GetKardexEntriesQuery()
            .Where(entry => entry.ProductId == productId && entry.WarehouseId == warehouseId)
            .OrderByDescending(entry => entry.Date)
            .Select(entry => MapToResponse(entry))
            .ToListAsync(cancellationToken);
    }

    private IQueryable<KardexEntry> GetKardexEntriesQuery()
    {
        return context.KardexEntries
            .AsNoTracking()
            .Include(entry => entry.Product)
            .Include(entry => entry.Warehouse);
    }

    private static KardexEntryResponse MapToResponse(KardexEntry entry)
    {
        return new KardexEntryResponse
        {
            Id = entry.Id,
            Date = entry.Date,
            ProductId = entry.ProductId,
            ProductCode = entry.Product?.Code ?? string.Empty,
            ProductName = entry.Product?.Name ?? string.Empty,
            WarehouseId = entry.WarehouseId,
            WarehouseName = entry.Warehouse?.Name ?? string.Empty,
            MovementId = entry.MovementId,
            MovementType = entry.MovementType,
            Quantity = entry.QuantityIn > 0 ? entry.QuantityIn : entry.QuantityOut,
            StockBefore = entry.StockBefore,
            StockAfter = entry.StockAfter,
            UnitCost = entry.UnitCost,
            CreatedByUserId = entry.CreatedByUserId ?? string.Empty,
            Observation = entry.Observation
        };
    }
}
