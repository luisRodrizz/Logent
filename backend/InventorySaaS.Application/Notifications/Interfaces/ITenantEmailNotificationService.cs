using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Notifications.Interfaces;

public interface ITenantEmailNotificationService
{
    Task SendBillingPaymentSucceededAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        CancellationToken cancellationToken = default);

    Task SendBillingPaymentFailedAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        CancellationToken cancellationToken = default);

    Task SendBillingSubscriptionCancelledAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        CancellationToken cancellationToken = default);

    Task SendPlanChangedByStripeAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        PlanType previousPlan,
        PlanType currentPlan,
        CancellationToken cancellationToken = default);

    Task SendUpgradeRequestResolvedAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        PlanType requestedPlan,
        bool approved,
        CancellationToken cancellationToken = default);

    Task SendPasswordChangedAsync(
        Guid companyId,
        string? recipient,
        string displayName,
        CancellationToken cancellationToken = default);
}
