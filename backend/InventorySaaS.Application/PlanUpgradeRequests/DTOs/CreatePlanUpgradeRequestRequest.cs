using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.PlanUpgradeRequests.DTOs;

public class CreatePlanUpgradeRequestRequest
{
    public PlanType RequestedPlan { get; set; }

    public string? Message { get; set; }
}
