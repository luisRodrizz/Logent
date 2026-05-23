using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Movements.DTOs;
using InventorySaaS.Application.Movements.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Movements;

public class MovementService(ApplicationDbContext context, IAuditLogWriter auditLogWriter) : IMovementService
{
    public async Task<IReadOnlyList<MovementResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var movements = await GetMovementsQuery()
            .OrderByDescending(movement => movement.Date)
            .ToListAsync(cancellationToken);

        return movements.Select(MapToResponse).ToList();
    }

    public async Task<MovementResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var movement = await GetMovementsQuery()
            .Where(movement => movement.Id == id)
            .FirstOrDefaultAsync(cancellationToken);

        return movement is null ? null : MapToResponse(movement);
    }

    public async Task<MovementResponse> CreateAsync(
        CreateMovementRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        await ValidateWarehousesAsync(request, cancellationToken);
        await ValidateProductsAsync(request, cancellationToken);

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var movement = new Movement
        {
            Id = Guid.NewGuid(),
            Type = request.Type,
            WarehouseOriginId = request.WarehouseOriginId,
            WarehouseDestinationId = request.WarehouseDestinationId,
            Date = now,
            Observation = NormalizeOptionalText(request.Observation),
            CreatedByUserId = userId,
            CreatedAt = now,
            IsActive = true
        };

        foreach (var detailRequest in request.Details)
        {
            var movementDetail = new MovementDetail
            {
                Id = Guid.NewGuid(),
                MovementId = movement.Id,
                ProductId = detailRequest.ProductId,
                Quantity = detailRequest.Quantity,
                UnitCost = detailRequest.UnitCost
            };

            movement.Details.Add(movementDetail);
        }

        context.Movements.Add(movement);

        foreach (var detail in movement.Details)
        {
            await ApplyStockAsync(movement, detail, userId, now, cancellationToken);
        }

        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Create,
            "Movement",
            movement.Id.ToString(),
            $"Movement created: {movement.Type} with {movement.Details.Count} detail(s)",
            cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var createdMovement = await GetByIdAsync(movement.Id, cancellationToken);

        return createdMovement
            ?? throw new InvalidOperationException("The created movement could not be loaded.");
    }

    private IQueryable<Movement> GetMovementsQuery()
    {
        return context.Movements
            .AsNoTracking()
            .AsSplitQuery()
            .Include(movement => movement.WarehouseOrigin)
            .Include(movement => movement.WarehouseDestination)
            .Include(movement => movement.Details)
            .ThenInclude(detail => detail.Product);
    }

    private async Task ValidateWarehousesAsync(CreateMovementRequest request, CancellationToken cancellationToken)
    {
        if (request.WarehouseOriginId.HasValue)
        {
            await EnsureActiveWarehouseExistsAsync(
                request.WarehouseOriginId.Value,
                "Warehouse origin does not exist or is inactive.",
                cancellationToken);
        }

        if (request.WarehouseDestinationId.HasValue)
        {
            await EnsureActiveWarehouseExistsAsync(
                request.WarehouseDestinationId.Value,
                "Warehouse destination does not exist or is inactive.",
                cancellationToken);
        }
    }

    private async Task EnsureActiveWarehouseExistsAsync(
        Guid warehouseId,
        string errorMessage,
        CancellationToken cancellationToken)
    {
        var exists = await context.Warehouses
            .AsNoTracking()
            .AnyAsync(warehouse => warehouse.Id == warehouseId && warehouse.IsActive, cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException(errorMessage);
        }
    }

    private async Task ValidateProductsAsync(CreateMovementRequest request, CancellationToken cancellationToken)
    {
        var productIds = request.Details
            .Select(detail => detail.ProductId)
            .Distinct()
            .ToList();

        var activeProductIds = await context.Products
            .AsNoTracking()
            .Where(product => productIds.Contains(product.Id) && product.IsActive)
            .Select(product => product.Id)
            .ToListAsync(cancellationToken);

        var missingProductIds = productIds.Except(activeProductIds).ToList();

        if (missingProductIds.Count > 0)
        {
            throw new InvalidOperationException("One or more products do not exist or are inactive.");
        }
    }

    private async Task ApplyStockAsync(
        Movement movement,
        MovementDetail detail,
        string userId,
        DateTime date,
        CancellationToken cancellationToken)
    {
        switch (movement.Type)
        {
            case MovementType.Entry:
                await ApplyEntryAsync(movement, detail, movement.WarehouseDestinationId!.Value, userId, date, cancellationToken);
                break;
            case MovementType.Exit:
                await ApplyExitAsync(movement, detail, movement.WarehouseOriginId!.Value, userId, date, cancellationToken);
                break;
            case MovementType.Transfer:
                await ApplyExitAsync(movement, detail, movement.WarehouseOriginId!.Value, userId, date, cancellationToken);
                await ApplyEntryAsync(movement, detail, movement.WarehouseDestinationId!.Value, userId, date, cancellationToken);
                break;
            default:
                throw new InvalidOperationException("Unsupported movement type.");
        }
    }

    private async Task ApplyEntryAsync(
        Movement movement,
        MovementDetail detail,
        Guid warehouseId,
        string userId,
        DateTime date,
        CancellationToken cancellationToken)
    {
        var stockItem = await GetOrCreateStockItemAsync(detail.ProductId, warehouseId, date, cancellationToken);
        var stockBefore = stockItem.Quantity;
        var stockAfter = stockBefore + detail.Quantity;

        stockItem.Quantity = stockAfter;
        stockItem.UpdatedAt = date;

        AddKardexEntry(
            movement,
            detail,
            warehouseId,
            date,
            quantityIn: detail.Quantity,
            quantityOut: 0,
            stockBefore,
            stockAfter,
            userId);
    }

    private async Task ApplyExitAsync(
        Movement movement,
        MovementDetail detail,
        Guid warehouseId,
        string userId,
        DateTime date,
        CancellationToken cancellationToken)
    {
        var stockItem = await context.StockItems
            .FirstOrDefaultAsync(
                stockItem => stockItem.ProductId == detail.ProductId && stockItem.WarehouseId == warehouseId,
                cancellationToken);

        if (stockItem is null || stockItem.Quantity < detail.Quantity)
        {
            throw new InvalidOperationException("Insufficient stock for one or more products.");
        }

        var stockBefore = stockItem.Quantity;
        var stockAfter = stockBefore - detail.Quantity;

        stockItem.Quantity = stockAfter;
        stockItem.UpdatedAt = date;

        AddKardexEntry(
            movement,
            detail,
            warehouseId,
            date,
            quantityIn: 0,
            quantityOut: detail.Quantity,
            stockBefore,
            stockAfter,
            userId);
    }

    private async Task<StockItem> GetOrCreateStockItemAsync(
        Guid productId,
        Guid warehouseId,
        DateTime date,
        CancellationToken cancellationToken)
    {
        var stockItem = await context.StockItems
            .FirstOrDefaultAsync(
                stockItem => stockItem.ProductId == productId && stockItem.WarehouseId == warehouseId,
                cancellationToken);

        if (stockItem is not null)
        {
            return stockItem;
        }

        stockItem = new StockItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = 0,
            UpdatedAt = date
        };

        context.StockItems.Add(stockItem);

        return stockItem;
    }

    private void AddKardexEntry(
        Movement movement,
        MovementDetail detail,
        Guid warehouseId,
        DateTime date,
        int quantityIn,
        int quantityOut,
        int stockBefore,
        int stockAfter,
        string userId)
    {
        context.KardexEntries.Add(new KardexEntry
        {
            Id = Guid.NewGuid(),
            ProductId = detail.ProductId,
            WarehouseId = warehouseId,
            MovementId = movement.Id,
            Date = date,
            MovementType = movement.Type,
            QuantityIn = quantityIn,
            QuantityOut = quantityOut,
            StockBefore = stockBefore,
            StockAfter = stockAfter,
            UnitCost = detail.UnitCost,
            CreatedByUserId = userId,
            Observation = movement.Observation
        });
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static MovementResponse MapToResponse(Movement movement)
    {
        return new MovementResponse
        {
            Id = movement.Id,
            Type = movement.Type,
            Date = movement.Date,
            WarehouseOriginId = movement.WarehouseOriginId,
            WarehouseOriginName = movement.WarehouseOrigin?.Name,
            WarehouseDestinationId = movement.WarehouseDestinationId,
            WarehouseDestinationName = movement.WarehouseDestination?.Name,
            Observation = movement.Observation,
            CreatedByUserId = movement.CreatedByUserId ?? string.Empty,
            Details = movement.Details
                .Select(detail => new MovementDetailResponse
                {
                    Id = detail.Id,
                    ProductId = detail.ProductId,
                    ProductCode = detail.Product?.Code ?? string.Empty,
                    ProductName = detail.Product?.Name ?? string.Empty,
                    Quantity = detail.Quantity,
                    UnitCost = detail.UnitCost
                })
                .ToList()
        };
    }
}
