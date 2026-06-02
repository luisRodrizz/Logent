using InventorySaaS.Application.Platform.Dashboard.DTOs;
using InventorySaaS.Application.Platform.Dashboard.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Platform.Dashboard;

public class PlatformDashboardService(ApplicationDbContext context) : IPlatformDashboardService
{
    public async Task<PlatformDashboardSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var companiesByPlan = await context.Companies
            .AsNoTracking()
            .GroupBy(company => company.Plan)
            .Select(group => new { Plan = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Plan, item => item.Count, cancellationToken);

        var companiesByStatus = await context.Companies
            .AsNoTracking()
            .GroupBy(company => company.IsActive)
            .Select(group => new { IsActive = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.IsActive, item => item.Count, cancellationToken);

        var requestsByStatus = await context.PlanUpgradeRequests
            .AsNoTracking()
            .GroupBy(request => request.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Status, item => item.Count, cancellationToken);

        var recentCompanies = await context.Companies
            .AsNoTracking()
            .OrderByDescending(company => company.CreatedAt)
            .Take(5)
            .Select(company => new RecentPlatformCompanyResponse
            {
                Id = company.Id,
                Name = company.Name,
                Plan = company.Plan,
                IsActive = company.IsActive,
                CreatedAt = company.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var recentUpgradeRequests = await context.PlanUpgradeRequests
            .AsNoTracking()
            .OrderByDescending(request => request.CreatedAt)
            .Take(5)
            .Select(request => new RecentPlatformUpgradeRequestResponse
            {
                Id = request.Id,
                CompanyName = request.Company.Name,
                CurrentPlan = request.CurrentPlan,
                RequestedPlan = request.RequestedPlan,
                Status = request.Status,
                CreatedAt = request.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PlatformDashboardSummaryResponse
        {
            TotalCompanies = companiesByStatus.Values.Sum(),
            ActiveCompanies = GetCount(companiesByStatus, true),
            SuspendedCompanies = GetCount(companiesByStatus, false),
            FreeCompanies = GetCount(companiesByPlan, PlanType.Free),
            StarterCompanies = GetCount(companiesByPlan, PlanType.Starter),
            ProCompanies = GetCount(companiesByPlan, PlanType.Pro),
            EnterpriseCompanies = GetCount(companiesByPlan, PlanType.Enterprise),
            TotalTenantUsers = await context.Users.CountAsync(user => user.CompanyId != null, cancellationToken),
            TotalProducts = await context.Products.CountAsync(cancellationToken),
            TotalWarehouses = await context.Warehouses.CountAsync(cancellationToken),
            PendingUpgradeRequests = GetCount(requestsByStatus, PlanUpgradeRequestStatus.Pending),
            ApprovedUpgradeRequests = GetCount(requestsByStatus, PlanUpgradeRequestStatus.Approved),
            RejectedUpgradeRequests = GetCount(requestsByStatus, PlanUpgradeRequestStatus.Rejected),
            RecentCompanies = recentCompanies,
            RecentUpgradeRequests = recentUpgradeRequests
        };
    }

    private static int GetCount<TKey>(IReadOnlyDictionary<TKey, int> counts, TKey key)
        where TKey : notnull
    {
        return counts.GetValueOrDefault(key);
    }
}
