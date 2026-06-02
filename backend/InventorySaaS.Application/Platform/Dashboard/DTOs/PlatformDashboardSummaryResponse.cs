using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Dashboard.DTOs;

public class PlatformDashboardSummaryResponse
{
    public int TotalCompanies { get; set; }

    public int ActiveCompanies { get; set; }

    public int SuspendedCompanies { get; set; }

    public int FreeCompanies { get; set; }

    public int StarterCompanies { get; set; }

    public int ProCompanies { get; set; }

    public int EnterpriseCompanies { get; set; }

    public int TotalTenantUsers { get; set; }

    public int TotalProducts { get; set; }

    public int TotalWarehouses { get; set; }

    public int PendingUpgradeRequests { get; set; }

    public int ApprovedUpgradeRequests { get; set; }

    public int RejectedUpgradeRequests { get; set; }

    public IReadOnlyCollection<RecentPlatformCompanyResponse> RecentCompanies { get; set; } =
        Array.Empty<RecentPlatformCompanyResponse>();

    public IReadOnlyCollection<RecentPlatformUpgradeRequestResponse> RecentUpgradeRequests { get; set; } =
        Array.Empty<RecentPlatformUpgradeRequestResponse>();
}

public class RecentPlatformCompanyResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public PlanType Plan { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class RecentPlatformUpgradeRequestResponse
{
    public Guid Id { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public PlanType CurrentPlan { get; set; }

    public PlanType RequestedPlan { get; set; }

    public PlanUpgradeRequestStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
}
