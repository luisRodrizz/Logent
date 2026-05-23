using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Categories.DTOs;
using InventorySaaS.Application.Categories.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Categories;

public class CategoryService(ApplicationDbContext context, IAuditLogWriter auditLogWriter) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Categories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.Name)
            .Select(category => MapToResponse(category))
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await context.Categories
            .AsNoTracking()
            .Where(category => category.Id == id && category.IsActive)
            .Select(category => MapToResponse(category))
            .FirstOrDefaultAsync(cancellationToken);

        return category;
    }

    public async Task<CategoryResponse> CreateAsync(
        CreateCategoryRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();

        await EnsureActiveNameIsUniqueAsync(name, excludedCategoryId: null, cancellationToken);

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = NormalizeDescription(request.Description),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Create,
            "Category",
            category.Id.ToString(),
            $"Category created: {category.Name}",
            cancellationToken);

        return MapToResponse(category);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateCategoryRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var category = await context.Categories
            .FirstOrDefaultAsync(category => category.Id == id && category.IsActive, cancellationToken);

        if (category is null)
        {
            return false;
        }

        var name = request.Name.Trim();

        await EnsureActiveNameIsUniqueAsync(name, id, cancellationToken);

        category.Name = name;
        category.Description = NormalizeDescription(request.Description);
        category.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Update,
            "Category",
            category.Id.ToString(),
            $"Category updated: {category.Name}",
            cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var category = await context.Categories
            .FirstOrDefaultAsync(category => category.Id == id && category.IsActive, cancellationToken);

        if (category is null)
        {
            return false;
        }

        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            userId,
            AuditAction.Delete,
            "Category",
            category.Id.ToString(),
            $"Category deactivated: {category.Name}",
            cancellationToken);

        return true;
    }

    private async Task EnsureActiveNameIsUniqueAsync(
        string name,
        Guid? excludedCategoryId,
        CancellationToken cancellationToken)
    {
        var duplicateExists = await context.Categories
            .AsNoTracking()
            .AnyAsync(
                category =>
                    category.IsActive
                    && category.Name == name
                    && (!excludedCategoryId.HasValue || category.Id != excludedCategoryId.Value),
                cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("An active category with the same name already exists.");
        }
    }

    private static string? NormalizeDescription(string? description)
    {
        return string.IsNullOrWhiteSpace(description) ? null : description.Trim();
    }

    private static CategoryResponse MapToResponse(Category category)
    {
        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
