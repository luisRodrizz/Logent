using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Billing.DTOs;

public class BillingStatusResponse
{
    public PlanType Plan { get; set; }

    public bool HasStripeCustomer { get; set; }

    public bool HasActiveSubscription { get; set; }

    public string? SubscriptionStatus { get; set; }

    public DateTime? CurrentPeriodEnd { get; set; }

    public bool CanManageBilling { get; set; }

    public SubscriptionAccessLevel AccessLevel { get; set; }

    public string AccessMessage { get; set; } = string.Empty;

    public string AccessDetail { get; set; } = string.Empty;
}
