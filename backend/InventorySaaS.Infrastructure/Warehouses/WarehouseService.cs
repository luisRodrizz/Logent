using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Warehouses.DTOs;
using InventorySaaS.Application.Warehouses.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Warehouses;

public class WarehouseService(ApplicationDbContext context, IAuditLogWriter auditLogWriter) : IWarehouseService
{
    public async Task<PagedResponse<WarehouseResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Warehouses
            .AsNoTracking()
            .Where(warehouse => warehouse.IsActive);

        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                warehouse =>
                    warehouse.Name.ToLower().Contains(search)
                    || (warehouse.Location != null && warehouse.Location.ToLower().Contains(search))
                    || (warehouse.Description != null && warehouse.Description.ToLower().Contains(search)));
        }

        return await query
            .OrderBy(warehouse => warehouse.Name)
            .Select(warehouse => MapToResponse(warehouse))
            .ToPagedResponseAsync(request, cancellationToken);
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
        string userId,
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
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Create,
            "Warehouse",
            warehouse.Id.ToString(),
            $"Warehouse created: {warehouse.Name}",
            cancellationToken);

        return MapToResponse(warehouse);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateWarehouseRequest request,
        string userId,
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
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Update,
            "Warehouse",
            warehouse.Id.ToString(),
            $"Warehouse updated: {warehouse.Name}",
            cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default)
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
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Delete,
            "Warehouse",
            warehouse.Id.ToString(),
            $"Warehouse deactivated: {warehouse.Name}",
            cancellationToken);

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
