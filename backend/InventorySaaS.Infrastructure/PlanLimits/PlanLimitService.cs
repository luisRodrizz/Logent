using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Plans.DTOs;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.PlanLimits;

public class PlanLimitService(ApplicationDbContext context) : IPlanLimitService
{
    private static readonly IReadOnlyDictionary<PlanType, PlanLimits> LimitsByPlan =
        new Dictionary<PlanType, PlanLimits>
        {
            [PlanType.Free] = new(3, 50, 2, 25, 20, 100),
            [PlanType.Starter] = new(10, 500, 5, 100, 100, 1000),
            [PlanType.Pro] = new(50, 5000, 20, 1000, 500, 10000),
            [PlanType.Enterprise] = new(
                int.MaxValue,
                int.MaxValue,
                int.MaxValue,
                int.MaxValue,
                int.MaxValue,
                int.MaxValue)
        };

    public async Task<PlanUsageResponse> GetUsageAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        var limits = await GetCompanyLimitsAsync(companyId, cancellationToken);
        var currentMonthStart = GetCurrentMonthStart();
        var nextMonthStart = currentMonthStart.AddMonths(1);

        return new PlanUsageResponse
        {
            Plan = limits.Plan,
            Usage = new PlanUsageMetrics
            {
                Users = await GetReservedUserSeatsAsync(companyId, cancellationToken),
                Products = await context.Products.CountAsync(
                    product => product.CompanyId == companyId && product.IsActive,
                    cancellationToken),
                Warehouses = await context.Warehouses.CountAsync(
                    warehouse => warehouse.CompanyId == companyId && warehouse.IsActive,
                    cancellationToken),
                Suppliers = await context.Suppliers.CountAsync(
                    supplier => supplier.CompanyId == companyId && supplier.IsActive,
                    cancellationToken),
                Categories = await context.Categories.CountAsync(
                    category => category.CompanyId == companyId && category.IsActive,
                    cancellationToken),
                MonthlyMovements = await context.Movements.CountAsync(
                    movement =>
                        movement.CompanyId == companyId
                        && movement.Date >= currentMonthStart
                        && movement.Date < nextMonthStart,
                    cancellationToken)
            },
            Limits = MapLimits(limits.Values)
        };
    }

    public Task EnsureCanCreateUserAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxUsers,
            () => GetReservedUserSeatsAsync(companyId, cancellationToken),
            "usuarios",
            "Mejora tu plan para crear más usuarios o enviar nuevas invitaciones.",
            cancellationToken);
    }

    public Task EnsureCanCreateInvitationAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxUsers,
            () => GetReservedUserSeatsAsync(companyId, cancellationToken),
            "usuarios",
            "Mejora tu plan para invitar más usuarios.",
            cancellationToken);
    }

    public Task EnsureCanAcceptInvitationAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxUsers,
            () => context.Users.CountAsync(user => user.CompanyId == companyId, cancellationToken),
            "usuarios",
            "Mejora tu plan para incorporar más usuarios.",
            cancellationToken);
    }

    public Task EnsureCanCreateProductAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxProducts,
            () => context.Products.CountAsync(
                product => product.CompanyId == companyId && product.IsActive,
                cancellationToken),
            "productos",
            "Mejora tu plan para registrar más productos.",
            cancellationToken);
    }

    public Task EnsureCanCreateWarehouseAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxWarehouses,
            () => context.Warehouses.CountAsync(
                warehouse => warehouse.CompanyId == companyId && warehouse.IsActive,
                cancellationToken),
            "almacenes",
            "Mejora tu plan para registrar más almacenes.",
            cancellationToken);
    }

    public Task EnsureCanCreateSupplierAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxSuppliers,
            () => context.Suppliers.CountAsync(
                supplier => supplier.CompanyId == companyId && supplier.IsActive,
                cancellationToken),
            "proveedores",
            "Mejora tu plan para registrar más proveedores.",
            cancellationToken);
    }

    public Task EnsureCanCreateCategoryAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxCategories,
            () => context.Categories.CountAsync(
                category => category.CompanyId == companyId && category.IsActive,
                cancellationToken),
            "categorías",
            "Mejora tu plan para registrar más categorías.",
            cancellationToken);
    }

    public Task EnsureCanCreateMovementAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        var currentMonthStart = GetCurrentMonthStart();
        var nextMonthStart = currentMonthStart.AddMonths(1);

        return EnsureWithinLimitAsync(
            companyId,
            limits => limits.MaxMonthlyMovements,
            () => context.Movements.CountAsync(
                movement =>
                    movement.CompanyId == companyId
                    && movement.Date >= currentMonthStart
                    && movement.Date < nextMonthStart,
                cancellationToken),
            "movimientos mensuales",
            "Mejora tu plan para registrar más movimientos durante este mes.",
            cancellationToken);
    }

    private async Task EnsureWithinLimitAsync(
        Guid companyId,
        Func<PlanLimits, int> getLimit,
        Func<Task<int>> getCurrentCount,
        string resourceName,
        string upgradeRecommendation,
        CancellationToken cancellationToken)
    {
        var limits = await GetCompanyLimitsAsync(companyId, cancellationToken);
        var limit = getLimit(limits.Values);

        if (limit is < 0 or int.MaxValue)
        {
            return;
        }

        var currentCount = await getCurrentCount();

        if (currentCount >= limit)
        {
            var message =
                $"Tu plan {limits.Plan} permite hasta {limit} {resourceName}. Actualmente tienes {currentCount}/{limit}.";

            throw new ApiException(
                403,
                message,
                upgradeRecommendation);
        }
    }

    private async Task<int> GetReservedUserSeatsAsync(Guid companyId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var users = await context.Users.CountAsync(user => user.CompanyId == companyId, cancellationToken);
        var pendingInvitations = await context.TenantUserInvitations.CountAsync(
            invitation =>
                invitation.CompanyId == companyId
                && invitation.Status == TenantUserInvitationStatus.Pending
                && invitation.ExpiresAt > now,
            cancellationToken);

        return users + pendingInvitations;
    }

    private static DateTime GetCurrentMonthStart()
    {
        var now = DateTime.UtcNow;

        return new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
    }

    private async Task<CompanyLimits> GetCompanyLimitsAsync(Guid companyId, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .AsNoTracking()
            .Where(company => company.Id == companyId)
            .Select(company => new { company.IsActive, company.Plan, company.StripeSubscriptionStatus })
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

        var effectivePlan = IsCancelledSubscription(company.StripeSubscriptionStatus)
            ? PlanType.Free
            : company.Plan;

        return new CompanyLimits(effectivePlan, LimitsByPlan[effectivePlan]);
    }

    private static bool IsCancelledSubscription(string? status)
    {
        return string.Equals(status, "cancelled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "canceled", StringComparison.OrdinalIgnoreCase);
    }

    private static PlanUsageMetrics MapLimits(PlanLimits limits)
    {
        return new PlanUsageMetrics
        {
            Users = limits.MaxUsers,
            Products = limits.MaxProducts,
            Warehouses = limits.MaxWarehouses,
            Suppliers = limits.MaxSuppliers,
            Categories = limits.MaxCategories,
            MonthlyMovements = limits.MaxMonthlyMovements
        };
    }

    private sealed record CompanyLimits(PlanType Plan, PlanLimits Values);

    private sealed record PlanLimits(
        int MaxUsers,
        int MaxProducts,
        int MaxWarehouses,
        int MaxSuppliers,
        int MaxCategories,
        int MaxMonthlyMovements);
}
