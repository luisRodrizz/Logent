using InventorySaaS.Application.Products.DTOs;
using InventorySaaS.Application.Products.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Products;

public class ProductService(ApplicationDbContext context) : IProductService
{
    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Supplier)
            .Where(product => product.IsActive)
            .OrderBy(product => product.Name)
            .Select(product => MapToResponse(product))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Supplier)
            .Where(product => product.Id == id && product.IsActive)
            .Select(product => MapToResponse(product))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductResponse> CreateAsync(
        CreateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = request.Code.Trim();
        var name = request.Name.Trim();

        await EnsureActiveCodeIsUniqueAsync(code, excludedProductId: null, cancellationToken);
        await EnsureActiveCategoryExistsAsync(request.CategoryId, cancellationToken);
        await EnsureActiveSupplierExistsAsync(request.SupplierId, cancellationToken);

        var product = new Product
        {
            Id = Guid.NewGuid(),
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

        var createdProduct = await GetByIdAsync(product.Id, cancellationToken);

        return createdProduct
            ?? throw new InvalidOperationException("The created product could not be loaded.");
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var product = await context.Products
            .FirstOrDefaultAsync(product => product.Id == id && product.IsActive, cancellationToken);

        if (product is null)
        {
            return false;
        }

        var code = request.Code.Trim();
        var name = request.Name.Trim();

        await EnsureActiveCodeIsUniqueAsync(code, id, cancellationToken);
        await EnsureActiveCategoryExistsAsync(request.CategoryId, cancellationToken);
        await EnsureActiveSupplierExistsAsync(request.SupplierId, cancellationToken);

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

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await context.Products
            .FirstOrDefaultAsync(product => product.Id == id && product.IsActive, cancellationToken);

        if (product is null)
        {
            return false;
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task EnsureActiveCodeIsUniqueAsync(
        string code,
        Guid? excludedProductId,
        CancellationToken cancellationToken)
    {
        var duplicateExists = await context.Products
            .AsNoTracking()
            .AnyAsync(
                product =>
                    product.IsActive
                    && product.Code == code
                    && (!excludedProductId.HasValue || product.Id != excludedProductId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active product with the same code already exists.");
        }
    }

    private async Task EnsureActiveCategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        var exists = await context.Categories
            .AsNoTracking()
            .AnyAsync(category => category.Id == categoryId && category.IsActive, cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException("Category does not exist or is inactive.");
        }
    }

    private async Task EnsureActiveSupplierExistsAsync(Guid? supplierId, CancellationToken cancellationToken)
    {
        if (!supplierId.HasValue)
        {
            return;
        }

        var exists = await context.Suppliers
            .AsNoTracking()
            .AnyAsync(supplier => supplier.Id == supplierId.Value && supplier.IsActive, cancellationToken);

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
