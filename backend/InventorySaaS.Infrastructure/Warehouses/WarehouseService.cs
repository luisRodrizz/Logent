using InventorySaaS.Application.Warehouses.DTOs;
using InventorySaaS.Application.Warehouses.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Warehouses;

public class WarehouseService(ApplicationDbContext context) : IWarehouseService
{
    public async Task<IReadOnlyList<WarehouseResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Warehouses
            .AsNoTracking()
            .Where(warehouse => warehouse.IsActive)
            .OrderBy(warehouse => warehouse.Name)
            .Select(warehouse => MapToResponse(warehouse))
            .ToListAsync(cancellationToken);
    }

    public async Task<WarehouseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Warehouses
            .AsNoTracking()
            .Where(warehouse => warehouse.Id == id && warehouse.IsActive)
            .Select(warehouse => MapToResponse(warehouse))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<WarehouseResponse> CreateAsync(
        CreateWarehouseRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();

        await EnsureActiveNameIsUniqueAsync(name, excludedWarehouseId: null, cancellationToken);

        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            Name = name,
            Location = NormalizeOptionalText(request.Location),
            Description = NormalizeOptionalText(request.Description),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Warehouses.Add(warehouse);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(warehouse);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateWarehouseRequest request,
        CancellationToken cancellationToken = default)
    {
        var warehouse = await context.Warehouses
            .FirstOrDefaultAsync(warehouse => warehouse.Id == id && warehouse.IsActive, cancellationToken);

        if (warehouse is null)
        {
            return false;
        }

        var name = request.Name.Trim();

        await EnsureActiveNameIsUniqueAsync(name, id, cancellationToken);

        warehouse.Name = name;
        warehouse.Location = NormalizeOptionalText(request.Location);
        warehouse.Description = NormalizeOptionalText(request.Description);
        warehouse.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var warehouse = await context.Warehouses
            .FirstOrDefaultAsync(warehouse => warehouse.Id == id && warehouse.IsActive, cancellationToken);

        if (warehouse is null)
        {
            return false;
        }

        warehouse.IsActive = false;
        warehouse.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task EnsureActiveNameIsUniqueAsync(
        string name,
        Guid? excludedWarehouseId,
        CancellationToken cancellationToken)
    {
        var duplicateExists = await context.Warehouses
            .AsNoTracking()
            .AnyAsync(
                warehouse =>
                    warehouse.IsActive
                    && warehouse.Name == name
                    && (!excludedWarehouseId.HasValue || warehouse.Id != excludedWarehouseId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active warehouse with the same name already exists.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static WarehouseResponse MapToResponse(Warehouse warehouse)
    {
        return new WarehouseResponse
        {
            Id = warehouse.Id,
            Name = warehouse.Name,
            Location = warehouse.Location,
            Description = warehouse.Description,
            IsActive = warehouse.IsActive,
            CreatedAt = warehouse.CreatedAt,
            UpdatedAt = warehouse.UpdatedAt
        };
    }
}
