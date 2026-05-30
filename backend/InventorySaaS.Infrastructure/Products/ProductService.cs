using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Products.DTOs;
using InventorySaaS.Application.Products.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Products;

public class ProductService(
    ApplicationDbContext context,
    IAuditLogWriter auditLogWriter,
    ICurrentUserContext currentUserContext) : IProductService
{
    public async Task<PagedResponse<ProductResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var query = context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Supplier)
            .Where(product => product.CompanyId == companyId && product.IsActive);

        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                product =>
                    product.Code.ToLower().Contains(search)
                    || product.Name.ToLower().Contains(search)
                    || (product.Description != null && product.Description.ToLower().Contains(search))
                    || (product.Category != null && product.Category.Name.ToLower().Contains(search))
                    || (product.Supplier != null && product.Supplier.BusinessName.ToLower().Contains(search)));
        }

        return await query
            .OrderBy(product => product.Name)
            .Select(product => MapToResponse(product))
            .ToPagedResponseAsync(request, cancellationToken);
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Supplier)
            .Where(product => product.Id == id && product.CompanyId == companyId && product.IsActive)
            .Select(product => MapToResponse(product))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductResponse> CreateAsync(
        CreateProductRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var code = request.Code.Trim();
        var name = request.Name.Trim();

        await EnsureActiveCodeIsUniqueAsync(companyId, code, excludedProductId: null, cancellationToken);
        await EnsureActiveCategoryExistsAsync(companyId, request.CategoryId, cancellationToken);
        await EnsureActiveSupplierExistsAsync(companyId, request.SupplierId, cancellationToken);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Code = code,
            Name = name,
            Description = NormalizeOptionalText(request.Description),
            CategoryId = request.CategoryId,
            SupplierId = request.SupplierId,
            PurchasePrice = request.PurchasePrice,
            SalePrice = request.SalePrice,
            MinimumStock = request.MinimumStock,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Products.Add(product);
        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Create,
            "Product",
            product.Id.ToString(),
            $"Product created: {product.Code} - {product.Name}",
            cancellationToken,
            companyId);

        var createdProduct = await GetByIdAsync(product.Id, cancellationToken);

        return createdProduct
            ?? throw new InvalidOperationException("The created product could not be loaded.");
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var product = await context.Products
            .FirstOrDefaultAsync(
                product => product.Id == id && product.CompanyId == companyId && product.IsActive,
                cancellationToken);

        if (product is null)
        {
            return false;
        }

        var code = request.Code.Trim();
        var name = request.Name.Trim();

        await EnsureActiveCodeIsUniqueAsync(companyId, code, id, cancellationToken);
        await EnsureActiveCategoryExistsAsync(companyId, request.CategoryId, cancellationToken);
        await EnsureActiveSupplierExistsAsync(companyId, request.SupplierId, cancellationToken);

        product.Code = code;
        product.Name = name;
        product.Description = NormalizeOptionalText(request.Description);
        product.CategoryId = request.CategoryId;
        product.SupplierId = request.SupplierId;
        product.PurchasePrice = request.PurchasePrice;
        product.SalePrice = request.SalePrice;
        product.MinimumStock = request.MinimumStock;
        product.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Update,
            "Product",
            product.Id.ToString(),
            $"Product updated: {product.Code} - {product.Name}",
            cancellationToken,
            companyId);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var product = await context.Products
            .FirstOrDefaultAsync(
                product => product.Id == id && product.CompanyId == companyId && product.IsActive,
                cancellationToken);

        if (product is null)
        {
            return false;
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Delete,
            "Product",
            product.Id.ToString(),
            $"Product deactivated: {product.Code} - {product.Name}",
            cancellationToken,
            companyId);

        return true;
    }

    private async Task EnsureActiveCodeIsUniqueAsync(
        Guid companyId,
        string code,
        Guid? excludedProductId,
        CancellationToken cancellationToken)
    {
        var duplicateExists = await context.Products
            .AsNoTracking()
            .AnyAsync(
                product =>
                    product.CompanyId == companyId
                    && product.IsActive
                    && product.Code == code
                    && (!excludedProductId.HasValue || product.Id != excludedProductId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active product with the same code already exists.");
        }
    }

    private async Task EnsureActiveCategoryExistsAsync(
        Guid companyId,
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Categories
            .AsNoTracking()
            .AnyAsync(
                category => category.Id == categoryId && category.CompanyId == companyId && category.IsActive,
                cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException("Category does not exist or is inactive.");
        }
    }

    private async Task EnsureActiveSupplierExistsAsync(
        Guid companyId,
        Guid? supplierId,
        CancellationToken cancellationToken)
    {
        if (!supplierId.HasValue)
        {
            return;
        }

        var exists = await context.Suppliers
            .AsNoTracking()
            .AnyAsync(
                supplier => supplier.Id == supplierId.Value && supplier.CompanyId == companyId && supplier.IsActive,
                cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException("Supplier does not exist or is inactive.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static ProductResponse MapToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            SupplierId = product.SupplierId,
            SupplierName = product.Supplier?.BusinessName,
            PurchasePrice = product.PurchasePrice,
            SalePrice = product.SalePrice,
            MinimumStock = product.MinimumStock,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
