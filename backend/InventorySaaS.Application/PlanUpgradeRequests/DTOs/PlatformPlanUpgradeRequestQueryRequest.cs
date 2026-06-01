using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.PlanUpgradeRequests.DTOs;

public class PlatformPlanUpgradeRequestQueryRequest : PagedRequest
{
    public string? CompanySearch { get; set; }

    public PlanUpgradeRequestStatus? Status { get; set; }

    public PlanType? RequestedPlan { get; set; }

    public string? NormalizeCompanySearch()
    {
        return string.IsNullOrWhiteSpace(CompanySearch) ? null : CompanySearch.Trim().ToLower();
    }
}
