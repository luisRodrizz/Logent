using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Suppliers.DTOs;
using InventorySaaS.Application.Suppliers.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Suppliers;

public class SupplierService(
    ApplicationDbContext context,
    IAuditLogWriter auditLogWriter,
    ICurrentUserContext currentUserContext,
    IPlanLimitService planLimitService) : ISupplierService
{
    public async Task<PagedResponse<SupplierResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var query = context.Suppliers
            .AsNoTracking()
            .Where(supplier => supplier.CompanyId == companyId && supplier.IsActive);

        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                supplier =>
                    supplier.BusinessName.ToLower().Contains(search)
                    || (supplier.Ruc != null && supplier.Ruc.ToLower().Contains(search))
                    || (supplier.Email != null && supplier.Email.ToLower().Contains(search))
                    || (supplier.Phone != null && supplier.Phone.ToLower().Contains(search)));
        }

        return await query
            .OrderBy(supplier => supplier.BusinessName)
            .Select(supplier => MapToResponse(supplier))
            .ToPagedResponseAsync(request, cancellationToken);
    }

    public async Task<SupplierResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await context.Suppliers
            .AsNoTracking()
            .Where(supplier => supplier.Id == id && supplier.CompanyId == companyId && supplier.IsActive)
            .Select(supplier => MapToResponse(supplier))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<SupplierResponse> CreateAsync(
        CreateSupplierRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var businessName = request.BusinessName.Trim();
        var ruc = NormalizeOptionalText(request.Ruc);

        await EnsureActiveBusinessNameIsUniqueAsync(
            companyId,
            businessName,
            excludedSupplierId: null,
            cancellationToken);
        await EnsureActiveRucIsUniqueAsync(companyId, ruc, excludedSupplierId: null, cancellationToken);
        await planLimitService.EnsureCanCreateSupplierAsync(companyId, cancellationToken);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
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
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Create,
            "Supplier",
            supplier.Id.ToString(),
            $"Supplier created: {supplier.BusinessName}",
            cancellationToken,
            companyId);

        return MapToResponse(supplier);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateSupplierRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var supplier = await context.Suppliers
            .FirstOrDefaultAsync(
                supplier => supplier.Id == id && supplier.CompanyId == companyId && supplier.IsActive,
                cancellationToken);

        if (supplier is null)
        {
            return false;
        }

        var businessName = request.BusinessName.Trim();
        var ruc = NormalizeOptionalText(request.Ruc);

        await EnsureActiveBusinessNameIsUniqueAsync(companyId, businessName, id, cancellationToken);
        await EnsureActiveRucIsUniqueAsync(companyId, ruc, id, cancellationToken);

        supplier.BusinessName = businessName;
        supplier.Ruc = ruc;
        supplier.Phone = NormalizeOptionalText(request.Phone);
        supplier.Email = NormalizeOptionalText(request.Email);
        supplier.Address = NormalizeOptionalText(request.Address);
        supplier.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Update,
            "Supplier",
            supplier.Id.ToString(),
            $"Supplier updated: {supplier.BusinessName}",
            cancellationToken,
            companyId);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var supplier = await context.Suppliers
            .FirstOrDefaultAsync(
                supplier => supplier.Id == id && supplier.CompanyId == companyId && supplier.IsActive,
                cancellationToken);

        if (supplier is null)
        {
            return false;
        }

        supplier.IsActive = false;
        supplier.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Delete,
            "Supplier",
            supplier.Id.ToString(),
            $"Supplier deactivated: {supplier.BusinessName}",
            cancellationToken,
            companyId);

        return true;
    }

    private async Task EnsureActiveBusinessNameIsUniqueAsync(
        Guid companyId,
        string businessName,
        Guid? excludedSupplierId,
        CancellationToken cancellationToken)
    {
        var duplicateExists = await context.Suppliers
            .AsNoTracking()
            .AnyAsync(
                supplier =>
                    supplier.CompanyId == companyId
                    && supplier.IsActive
                    && supplier.BusinessName == businessName
                    && (!excludedSupplierId.HasValue || supplier.Id != excludedSupplierId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active supplier with the same business name already exists.");
        }
    }

    private async Task EnsureActiveRucIsUniqueAsync(
        Guid companyId,
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
                    supplier.CompanyId == companyId
                    && supplier.IsActive
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
