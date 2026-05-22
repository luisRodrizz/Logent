using InventorySaaS.Application.Suppliers.DTOs;
using InventorySaaS.Application.Suppliers.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Suppliers;

public class SupplierService(ApplicationDbContext context) : ISupplierService
{
    public async Task<IReadOnlyList<SupplierResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Suppliers
            .AsNoTracking()
            .Where(supplier => supplier.IsActive)
            .OrderBy(supplier => supplier.BusinessName)
            .Select(supplier => MapToResponse(supplier))
            .ToListAsync(cancellationToken);
    }

    public async Task<SupplierResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Suppliers
            .AsNoTracking()
            .Where(supplier => supplier.Id == id && supplier.IsActive)
            .Select(supplier => MapToResponse(supplier))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<SupplierResponse> CreateAsync(
        CreateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessName = request.BusinessName.Trim();
        var ruc = NormalizeOptionalText(request.Ruc);

        await EnsureActiveBusinessNameIsUniqueAsync(businessName, excludedSupplierId: null, cancellationToken);
        await EnsureActiveRucIsUniqueAsync(ruc, excludedSupplierId: null, cancellationToken);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            BusinessName = businessName,
            Ruc = ruc,
            Phone = NormalizeOptionalText(request.Phone),
            Email = NormalizeOptionalText(request.Email),
            Address = NormalizeOptionalText(request.Address),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Suppliers.Add(supplier);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(supplier);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        var supplier = await context.Suppliers
            .FirstOrDefaultAsync(supplier => supplier.Id == id && supplier.IsActive, cancellationToken);

        if (supplier is null)
        {
            return false;
        }

        var businessName = request.BusinessName.Trim();
        var ruc = NormalizeOptionalText(request.Ruc);

        await EnsureActiveBusinessNameIsUniqueAsync(businessName, id, cancellationToken);
        await EnsureActiveRucIsUniqueAsync(ruc, id, cancellationToken);

        supplier.BusinessName = businessName;
        supplier.Ruc = ruc;
        supplier.Phone = NormalizeOptionalText(request.Phone);
        supplier.Email = NormalizeOptionalText(request.Email);
        supplier.Address = NormalizeOptionalText(request.Address);
        supplier.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var supplier = await context.Suppliers
            .FirstOrDefaultAsync(supplier => supplier.Id == id && supplier.IsActive, cancellationToken);

        if (supplier is null)
        {
            return false;
        }

        supplier.IsActive = false;
        supplier.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task EnsureActiveBusinessNameIsUniqueAsync(
        string businessName,
        Guid? excludedSupplierId,
        CancellationToken cancellationToken)
    {
        var duplicateExists = await context.Suppliers
            .AsNoTracking()
            .AnyAsync(
                supplier =>
                    supplier.IsActive
                    && supplier.BusinessName == businessName
                    && (!excludedSupplierId.HasValue || supplier.Id != excludedSupplierId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active supplier with the same business name already exists.");
        }
    }

    private async Task EnsureActiveRucIsUniqueAsync(
        string? ruc,
        Guid? excludedSupplierId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(ruc))
        {
            return;
        }

        var duplicateExists = await context.Suppliers
            .AsNoTracking()
            .AnyAsync(
                supplier =>
                    supplier.IsActive
                    && supplier.Ruc == ruc
                    && (!excludedSupplierId.HasValue || supplier.Id != excludedSupplierId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active supplier with the same RUC already exists.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static SupplierResponse MapToResponse(Supplier supplier)
    {
        return new SupplierResponse
        {
            Id = supplier.Id,
            BusinessName = supplier.BusinessName,
            Ruc = supplier.Ruc,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt
        };
    }
}
