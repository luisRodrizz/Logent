using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Common.DTOs;

public sealed record SubscriptionAccessDecision(
    SubscriptionAccessLevel Level,
    PlanType EffectivePlan,
    string Message,
    string Detail)
{
    public bool CanPerformCriticalWrites => Level == SubscriptionAccessLevel.ActiveAccess;
}
