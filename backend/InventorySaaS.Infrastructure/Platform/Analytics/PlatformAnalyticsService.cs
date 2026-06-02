using System.Globalization;
using InventorySaaS.Application.Platform.Analytics.DTOs;
using InventorySaaS.Application.Platform.Analytics.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Platform.Analytics;

public class PlatformAnalyticsService(ApplicationDbContext context) : IPlatformAnalyticsService
{
    private static readonly CultureInfo SpanishCulture = CultureInfo.GetCultureInfo("es-PE");

    public async Task<PlatformAnalyticsSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var firstMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-11);
        var months = Enumerable.Range(0, 12).Select(firstMonth.AddMonths).ToList();

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

        var upgradeRequestsByStatus = await context.PlanUpgradeRequests
            .AsNoTracking()
            .GroupBy(request => request.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Status, item => item.Count, cancellationToken);

        var companyGrowth = await context.Companies
            .AsNoTracking()
            .Where(company => company.CreatedAt >= firstMonth)
            .GroupBy(company => new { company.CreatedAt.Year, company.CreatedAt.Month })
            .Select(group => new { group.Key.Year, group.Key.Month, Count = group.Count() })
            .ToListAsync(cancellationToken);

        var upgradeRequestGrowth = await context.PlanUpgradeRequests
            .AsNoTracking()
            .Where(request => request.CreatedAt >= firstMonth)
            .GroupBy(request => new { request.CreatedAt.Year, request.CreatedAt.Month, request.Status })
            .Select(group => new { group.Key.Year, group.Key.Month, group.Key.Status, Count = group.Count() })
            .ToListAsync(cancellationToken);

        return new PlatformAnalyticsSummaryResponse
        {
            TotalCompanies = companiesByStatus.Values.Sum(),
            ActiveCompanies = GetCount(companiesByStatus, true),
            PendingUpgradeRequests = GetCount(upgradeRequestsByStatus, PlanUpgradeRequestStatus.Pending),
            TotalTenantUsers = await context.Users.CountAsync(user => user.CompanyId != null, cancellationToken),
            TotalProducts = await context.Products.CountAsync(cancellationToken),
            CompaniesByPlan = Enum.GetValues<PlanType>()
                .Select(plan => new PlatformAnalyticsPlanCountResponse
                {
                    Plan = plan,
                    Count = GetCount(companiesByPlan, plan)
                })
                .ToList(),
            CompaniesByStatus =
            [
                new PlatformAnalyticsStatusCountResponse
                {
                    Status = "Active",
                    Count = GetCount(companiesByStatus, true)
                },
                new PlatformAnalyticsStatusCountResponse
                {
                    Status = "Suspended",
                    Count = GetCount(companiesByStatus, false)
                }
            ],
            UpgradeRequestsByStatus = Enum.GetValues<PlanUpgradeRequestStatus>()
                .Select(status => new PlatformAnalyticsStatusCountResponse
                {
                    Status = status.ToString(),
                    Count = GetCount(upgradeRequestsByStatus, status)
                })
                .ToList(),
            MonthlyCompanyGrowth = months.Select(month => new MonthlyCompanyGrowthResponse
            {
                Month = ToMonthKey(month),
                Label = ToMonthLabel(month),
                Count = companyGrowth
                    .Where(item => item.Year == month.Year && item.Month == month.Month)
                    .Sum(item => item.Count)
            }).ToList(),
            MonthlyUpgradeRequests = months.Select(month =>
            {
                var requests = upgradeRequestGrowth
                    .Where(item => item.Year == month.Year && item.Month == month.Month)
                    .ToList();

                var pending = requests
                    .Where(item => item.Status == PlanUpgradeRequestStatus.Pending)
                    .Sum(item => item.Count);
                var approved = requests
                    .Where(item => item.Status == PlanUpgradeRequestStatus.Approved)
                    .Sum(item => item.Count);
                var rejected = requests
                    .Where(item => item.Status == PlanUpgradeRequestStatus.Rejected)
                    .Sum(item => item.Count);

                return new MonthlyUpgradeRequestsResponse
                {
                    Month = ToMonthKey(month),
                    Label = ToMonthLabel(month),
                    Pending = pending,
                    Approved = approved,
                    Rejected = rejected,
                    Total = pending + approved + rejected
                };
            }).ToList(),
            TopCompaniesByProducts = await GetTopCompaniesByProductsAsync(cancellationToken),
            TopCompaniesByWarehouses = await GetTopCompaniesByWarehousesAsync(cancellationToken),
            TopCompaniesByUsers = await GetTopCompaniesByUsersAsync(cancellationToken)
        };
    }

    private Task<List<TopPlatformCompanyResponse>> GetTopCompaniesByProductsAsync(
        CancellationToken cancellationToken)
    {
        return context.Companies
            .AsNoTracking()
            .Select(company => new TopPlatformCompanyResponse
            {
                CompanyId = company.Id,
                CompanyName = company.Name,
                Plan = company.Plan,
                Count = company.Products.Count
            })
            .OrderByDescending(company => company.Count)
            .ThenBy(company => company.CompanyName)
            .Take(5)
            .ToListAsync(cancellationToken);
    }

    private Task<List<TopPlatformCompanyResponse>> GetTopCompaniesByWarehousesAsync(
        CancellationToken cancellationToken)
    {
        return context.Companies
            .AsNoTracking()
            .Select(company => new TopPlatformCompanyResponse
            {
                CompanyId = company.Id,
                CompanyName = company.Name,
                Plan = company.Plan,
                Count = company.Warehouses.Count
            })
            .OrderByDescending(company => company.Count)
            .ThenBy(company => company.CompanyName)
            .Take(5)
            .ToListAsync(cancellationToken);
    }

    private Task<List<TopPlatformCompanyResponse>> GetTopCompaniesByUsersAsync(
        CancellationToken cancellationToken)
    {
        return context.Companies
            .AsNoTracking()
            .Select(company => new TopPlatformCompanyResponse
            {
                CompanyId = company.Id,
                CompanyName = company.Name,
                Plan = company.Plan,
                Count = context.Users.Count(user => user.CompanyId == company.Id)
            })
            .OrderByDescending(company => company.Count)
            .ThenBy(company => company.CompanyName)
            .Take(5)
            .ToListAsync(cancellationToken);
    }

    private static int GetCount<TKey>(IReadOnlyDictionary<TKey, int> counts, TKey key)
        where TKey : notnull
    {
        return counts.GetValueOrDefault(key);
    }

    private static string ToMonthKey(DateTime month)
    {
        return month.ToString("yyyy-MM", CultureInfo.InvariantCulture);
    }

    private static string ToMonthLabel(DateTime month)
    {
        var label = month.ToString("MMM yyyy", SpanishCulture).TrimEnd('.');

        return char.ToUpper(label[0], SpanishCulture) + label[1..];
    }
}
