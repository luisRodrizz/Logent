namespace InventorySaaS.Application.PlanUpgradeRequests.DTOs;

public class PlatformPlanUpgradeRequestDetailResponse : PlatformPlanUpgradeRequestListItemResponse
{
    public string RequestedByUserId { get; set; } = string.Empty;

    public string? ResolutionNote { get; set; }

    public string? ResolvedByName { get; set; }

    public string? ResolvedByUserId { get; set; }
}
