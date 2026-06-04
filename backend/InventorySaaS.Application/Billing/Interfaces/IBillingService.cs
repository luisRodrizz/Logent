using InventorySaaS.Application.Billing.DTOs;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Billing.Interfaces;

public interface IBillingService
{
    BillingConfigResponse GetConfig();

    Task<BillingStatusResponse> GetStatusAsync(CancellationToken cancellationToken = default);

    Task<CreateCheckoutSessionResponse> CreateCheckoutSessionAsync(
        PlanType requestedPlan,
        CancellationToken cancellationToken = default);

    Task<CreateBillingPortalSessionResponse> CreatePortalSessionAsync(
        CancellationToken cancellationToken = default);

    Task HandleWebhookAsync(
        string payload,
        string signature,
        CancellationToken cancellationToken = default);
}
