using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.PlanUpgradeRequests.DTOs;

public class PlatformPlanUpgradeRequestListItemResponse
{
    public Guid Id { get; set; }

    public Guid CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public PlanType CurrentPlan { get; set; }

    public PlanType RequestedPlan { get; set; }

    public PlanUpgradeRequestStatus Status { get; set; }

    public string? Message { get; set; }

    public string RequestedByName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }
}
