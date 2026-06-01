using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.PlanUpgradeRequests.DTOs;

public class PlanUpgradeRequestResponse
{
    public Guid Id { get; set; }

    public PlanType CurrentPlan { get; set; }

    public PlanType RequestedPlan { get; set; }

    public PlanUpgradeRequestStatus Status { get; set; }

    public string? Message { get; set; }

    public string? ResolutionNote { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }
}
