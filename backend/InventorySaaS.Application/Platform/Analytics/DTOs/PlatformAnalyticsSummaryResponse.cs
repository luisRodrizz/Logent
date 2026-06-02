using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Analytics.DTOs;

public class PlatformAnalyticsSummaryResponse
{
    public int TotalCompanies { get; set; }

    public int ActiveCompanies { get; set; }

    public int PendingUpgradeRequests { get; set; }

    public int TotalTenantUsers { get; set; }

    public int TotalProducts { get; set; }

    public IReadOnlyCollection<PlatformAnalyticsPlanCountResponse> CompaniesByPlan { get; set; } =
        Array.Empty<PlatformAnalyticsPlanCountResponse>();

    public IReadOnlyCollection<PlatformAnalyticsStatusCountResponse> CompaniesByStatus { get; set; } =
        Array.Empty<PlatformAnalyticsStatusCountResponse>();

    public IReadOnlyCollection<PlatformAnalyticsStatusCountResponse> UpgradeRequestsByStatus { get; set; } =
        Array.Empty<PlatformAnalyticsStatusCountResponse>();

    public IReadOnlyCollection<MonthlyCompanyGrowthResponse> MonthlyCompanyGrowth { get; set; } =
        Array.Empty<MonthlyCompanyGrowthResponse>();

    public IReadOnlyCollection<MonthlyUpgradeRequestsResponse> MonthlyUpgradeRequests { get; set; } =
        Array.Empty<MonthlyUpgradeRequestsResponse>();

    public IReadOnlyCollection<TopPlatformCompanyResponse> TopCompaniesByProducts { get; set; } =
        Array.Empty<TopPlatformCompanyResponse>();

    public IReadOnlyCollection<TopPlatformCompanyResponse> TopCompaniesByWarehouses { get; set; } =
        Array.Empty<TopPlatformCompanyResponse>();

    public IReadOnlyCollection<TopPlatformCompanyResponse> TopCompaniesByUsers { get; set; } =
        Array.Empty<TopPlatformCompanyResponse>();
}

public class PlatformAnalyticsPlanCountResponse
{
    public PlanType Plan { get; set; }

    public int Count { get; set; }
}

public class PlatformAnalyticsStatusCountResponse
{
    public string Status { get; set; } = string.Empty;

    public int Count { get; set; }
}

public class MonthlyCompanyGrowthResponse
{
    public string Month { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public int Count { get; set; }
}

public class MonthlyUpgradeRequestsResponse
{
    public string Month { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public int Pending { get; set; }

    public int Approved { get; set; }

    public int Rejected { get; set; }

    public int Total { get; set; }
}

public class TopPlatformCompanyResponse
{
    public Guid CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public PlanType Plan { get; set; }

    public int Count { get; set; }
}
