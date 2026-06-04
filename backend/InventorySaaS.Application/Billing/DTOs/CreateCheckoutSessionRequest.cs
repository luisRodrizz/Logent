using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Billing.DTOs;

public class CreateCheckoutSessionRequest
{
    public PlanType RequestedPlan { get; set; }
}
