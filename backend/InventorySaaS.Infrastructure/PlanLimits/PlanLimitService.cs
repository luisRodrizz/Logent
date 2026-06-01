using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.PlanLimits;

public class PlanLimitService(ApplicationDbContext context) : IPlanLimitService
{
    private static readonly IReadOnlyDictionary<PlanType, PlanLimits> LimitsByPlan =
        new Dictionary<PlanType, PlanLimits>
        {
            [PlanType.Free] = new(3, 50, 2, 25, 20),
            [PlanType.Starter] = new(10, 500, 5, 100, 100),
            [PlanType.Pro] = new(50, 5000, 20, 1000, 500),
            [PlanType.Enterprise] = new(
                int.MaxValue,
                int.MaxValue,
                int.MaxValue,
                int.MaxValue,
                int.MaxValue)
        };

    public Task EnsureCanCreateUserAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxUsers,
            () => context.Users.CountAsync(user => user.CompanyId == companyId, cancellationToken),
            "usuarios",
            cancellationToken);
    }

    public Task EnsureCanCreateProductAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxProducts,
            () => context.Products.CountAsync(product => product.CompanyId == companyId, cancellationToken),
            "productos",
            cancellationToken);
    }

    public Task EnsureCanCreateWarehouseAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxWarehouses,
            () => context.Warehouses.CountAsync(warehouse => warehouse.CompanyId == companyId, cancellationToken),
            "almacenes",
            cancellationToken);
    }

    public Task EnsureCanCreateSupplierAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxSuppliers,
            () => context.Suppliers.CountAsync(supplier => supplier.CompanyId == companyId, cancellationToken),
            "proveedores",
            cancellationToken);
    }

    public Task EnsureCanCreateCategoryAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxCategories,
            () => context.Categories.CountAsync(category => category.CompanyId == companyId, cancellationToken),
            "categorías",
            cancellationToken);
    }

    private async Task EnsureWithinLimitAsync(
        Guid companyId,
        Func<PlanLimits, int> getLimit,
        Func<Task<int>> getCurrentCount,
        string resourceName,
        CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .AsNoTracking()
            .Where(company => company.Id == companyId)
            .Select(company => new { company.IsActive, company.Plan })
            .FirstOrDefaultAsync(cancellationToken);

        if (company is null)
        {
            throw new ApiException(
                404,
                "Company not found.",
                "No company was found for the authenticated user.");
        }

        if (!company.IsActive)
        {
            throw new ApiException(
                403,
                "Company access is suspended.",
                "Contact the platform administrator to reactivate this company.");
        }

        var limit = getLimit(LimitsByPlan[company.Plan]);

        if (limit == int.MaxValue)
        {
            return;
        }

        var currentCount = await getCurrentCount();

        if (currentCount >= limit)
        {
            var message = $"Tu plan actual permite un máximo de {limit} {resourceName}.";

            throw new ApiException(
                403,
                message,
                "Actualiza el plan de tu empresa para crear más recursos.");
        }
    }

    private sealed record PlanLimits(
        int MaxUsers,
        int MaxProducts,
        int MaxWarehouses,
        int MaxSuppliers,
        int MaxCategories);
}
