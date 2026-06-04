using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Billing.DTOs;
using InventorySaaS.Application.Billing.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace InventorySaaS.Infrastructure.Billing;

public class BillingService(
    ApplicationDbContext context,
    ICurrentUserContext currentUserContext,
    IAuditLogWriter auditLogWriter,
    IOptions<StripeSettings> stripeOptions,
    ILogger<BillingService> logger) : IBillingService
{
    private const string CompanyIdMetadataKey = "companyId";
    private const string RequestedPlanMetadataKey = "requestedPlan";
    private readonly StripeSettings settings = stripeOptions.Value;

    public BillingConfigResponse GetConfig()
    {
        return new BillingConfigResponse
        {
            PublishableKey = IsTestKey(settings.PublishableKey, "pk_test_")
                ? settings.PublishableKey
                : string.Empty
        };
    }

    public async Task<BillingStatusResponse> GetStatusAsync(CancellationToken cancellationToken = default)
    {
        var company = await GetCurrentCompanyAsync(cancellationToken);

        return new BillingStatusResponse
        {
            Plan = company.Plan,
            HasStripeCustomer = !string.IsNullOrWhiteSpace(company.StripeCustomerId),
            HasActiveSubscription = IsActiveSubscription(company.StripeSubscriptionStatus),
            SubscriptionStatus = company.StripeSubscriptionStatus,
            CurrentPeriodEnd = company.StripeCurrentPeriodEnd,
            CanManageBilling = !string.IsNullOrWhiteSpace(company.StripeCustomerId)
        };
    }

    public async Task<CreateCheckoutSessionResponse> CreateCheckoutSessionAsync(
        PlanType requestedPlan,
        CancellationToken cancellationToken = default)
    {
        ValidateCheckoutConfiguration();

        if (requestedPlan is not (PlanType.Starter or PlanType.Pro))
        {
            throw new ApiException(
                400,
                "Stripe checkout is available only for Starter and Pro.",
                "Enterprise requires a commercial consultation and Free does not require payment.");
        }

        var company = await GetCurrentCompanyAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(company.StripeSubscriptionId)
            && IsActiveSubscription(company.StripeSubscriptionStatus))
        {
            throw new ApiException(
                400,
                "An active Stripe subscription already exists.",
                "Use the billing portal to manage the company's current subscription.");
        }

        if (requestedPlan <= company.Plan)
        {
            throw new ApiException(
                400,
                "Select a higher paid plan.",
                "Stripe checkout can only be created for a plan above the company's current plan.");
        }

        var stripeClient = CreateStripeClient();

        if (string.IsNullOrWhiteSpace(company.StripeCustomerId))
        {
            var customerService = new CustomerService(stripeClient);
            var customer = await customerService.CreateAsync(
                new CustomerCreateOptions
                {
                    Email = company.ContactEmail ?? company.Email,
                    Name = company.CommercialName ?? company.Name,
                    Metadata = CreateMetadata(company.Id, requestedPlan)
                },
                cancellationToken: cancellationToken);

            company.StripeCustomerId = customer.Id;
            company.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);
        }

        var sessionService = new SessionService(stripeClient);
        var session = await sessionService.CreateAsync(
            new SessionCreateOptions
            {
                Mode = "subscription",
                Customer = company.StripeCustomerId,
                ClientReferenceId = company.Id.ToString(),
                SuccessUrl = settings.SuccessUrl,
                CancelUrl = settings.CancelUrl,
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        Price = GetPriceId(requestedPlan),
                        Quantity = 1
                    }
                ],
                Metadata = CreateMetadata(company.Id, requestedPlan),
                SubscriptionData = new SessionSubscriptionDataOptions
                {
                    Metadata = CreateMetadata(company.Id, requestedPlan)
                }
            },
            cancellationToken: cancellationToken);

        if (string.IsNullOrWhiteSpace(session.Url))
        {
            throw new ApiException(
                502,
                "Stripe did not return a checkout URL.",
                "Try creating the checkout session again.");
        }

        logger.LogInformation(
            "Stripe Checkout Session created for CompanyId {CompanyId}, RequestedPlan {RequestedPlan}, SessionId {SessionId}.",
            company.Id,
            requestedPlan,
            session.Id);

        return new CreateCheckoutSessionResponse
        {
            SessionUrl = session.Url
        };
    }

    public async Task<CreateBillingPortalSessionResponse> CreatePortalSessionAsync(
        CancellationToken cancellationToken = default)
    {
        ValidateSecretKey();
        var company = await GetCurrentCompanyAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(company.StripeCustomerId))
        {
            throw new ApiException(
                400,
                "Stripe customer is not available.",
                "Complete a Stripe checkout before opening the billing portal.");
        }

        var portalService = new Stripe.BillingPortal.SessionService(CreateStripeClient());
        var portalSession = await portalService.CreateAsync(
            new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = company.StripeCustomerId,
                ReturnUrl = GetPortalReturnUrl()
            },
            cancellationToken: cancellationToken);

        return new CreateBillingPortalSessionResponse
        {
            SessionUrl = portalSession.Url
        };
    }

    public async Task HandleWebhookAsync(
        string payload,
        string signature,
        CancellationToken cancellationToken = default)
    {
        ValidateWebhookConfiguration();

        Stripe.Event stripeEvent;

        try
        {
            stripeEvent = EventUtility.ConstructEvent(payload, signature, settings.WebhookSecret);
        }
        catch (StripeException exception)
        {
            logger.LogWarning(exception, "Stripe webhook signature validation failed.");
            throw new ApiException(
                400,
                "Invalid Stripe webhook signature.",
                "The webhook payload could not be verified.");
        }

        logger.LogInformation(
            "Processing Stripe webhook EventId {EventId}, Type {EventType}.",
            stripeEvent.Id,
            stripeEvent.Type);

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed" when stripeEvent.Data.Object is Session session:
                await HandleCheckoutCompletedAsync(session, cancellationToken);
                break;
            case "customer.subscription.created" when stripeEvent.Data.Object is Subscription createdSubscription:
                await HandleSubscriptionUpdatedAsync(createdSubscription, cancellationToken);
                break;
            case "customer.subscription.updated" when stripeEvent.Data.Object is Subscription updatedSubscription:
                await HandleSubscriptionUpdatedAsync(updatedSubscription, cancellationToken);
                break;
            case "customer.subscription.deleted" when stripeEvent.Data.Object is Subscription deletedSubscription:
                await HandleSubscriptionDeletedAsync(deletedSubscription, cancellationToken);
                break;
            case "invoice.payment_succeeded" when stripeEvent.Data.Object is Invoice paidInvoice:
                await HandleInvoiceStatusAsync(paidInvoice.CustomerId, "active", cancellationToken);
                break;
            case "invoice.payment_failed" when stripeEvent.Data.Object is Invoice failedInvoice:
                await HandleInvoiceStatusAsync(failedInvoice.CustomerId, "past_due", cancellationToken);
                break;
        }
    }

    private async Task HandleCheckoutCompletedAsync(Session session, CancellationToken cancellationToken)
    {
        var metadata = session.Metadata;
        var companyId = GetCompanyId(metadata);
        var requestedPlan = GetRequestedPaidPlan(metadata);
        var company = await context.Companies.FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken)
            ?? throw new ApiException(404, "Company not found.", "The Stripe Checkout company does not exist.");
        var previousPlan = company.Plan;

        company.StripeCustomerId = session.CustomerId ?? company.StripeCustomerId;
        company.StripeSubscriptionId = session.SubscriptionId ?? company.StripeSubscriptionId;
        company.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(company.StripeSubscriptionId))
        {
            var subscription = await new SubscriptionService(CreateStripeClient())
                .GetAsync(company.StripeSubscriptionId, cancellationToken: cancellationToken);

            ApplySubscription(company, subscription, requestedPlan);
        }

        await context.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(
            company,
            AuditAction.BillingCheckoutCompleted,
            $"Stripe checkout completed for {requestedPlan}.",
            cancellationToken);

        if (previousPlan != company.Plan)
        {
            await WriteAuditAsync(
                company,
                AuditAction.PlanChangedByStripe,
                $"Plan changed by Stripe: {previousPlan} -> {company.Plan}.",
                cancellationToken);
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(
        Subscription subscription,
        CancellationToken cancellationToken)
    {
        var company = await FindCompanyForSubscriptionAsync(subscription, cancellationToken);

        if (company is null)
        {
            logger.LogWarning(
                "No company found for Stripe subscription {SubscriptionId}, CustomerId {CustomerId}.",
                subscription.Id,
                subscription.CustomerId);
            return;
        }

        var previousPlan = company.Plan;
        var requestedPlan = GetSubscriptionPlan(subscription);

        ApplySubscription(company, subscription, requestedPlan);
        await context.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(
            company,
            AuditAction.BillingSubscriptionUpdated,
            $"Stripe subscription updated with status {subscription.Status}.",
            cancellationToken);

        if (previousPlan != company.Plan)
        {
            await WriteAuditAsync(
                company,
                AuditAction.PlanChangedByStripe,
                $"Plan changed by Stripe: {previousPlan} -> {company.Plan}.",
                cancellationToken);
        }
    }

    private async Task HandleSubscriptionDeletedAsync(
        Subscription subscription,
        CancellationToken cancellationToken)
    {
        var company = await FindCompanyForSubscriptionAsync(subscription, cancellationToken);

        if (company is null)
        {
            return;
        }

        var previousPlan = company.Plan;
        company.StripeSubscriptionId = subscription.Id;
        company.StripeSubscriptionStatus = "cancelled";
        company.StripeCurrentPeriodEnd = GetCurrentPeriodEnd(subscription);
        company.Plan = PlanType.Free;
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(
            company,
            AuditAction.BillingSubscriptionCancelled,
            $"Stripe subscription cancelled. Previous plan: {previousPlan}.",
            cancellationToken);

        if (previousPlan != company.Plan)
        {
            await WriteAuditAsync(
                company,
                AuditAction.PlanChangedByStripe,
                $"Plan changed by Stripe: {previousPlan} -> {company.Plan}.",
                cancellationToken);
        }
    }

    private async Task HandleInvoiceStatusAsync(
        string? customerId,
        string status,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(customerId))
        {
            return;
        }

        var company = await context.Companies.FirstOrDefaultAsync(
            item => item.StripeCustomerId == customerId,
            cancellationToken);

        if (company is null || string.Equals(company.StripeSubscriptionStatus, status, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        company.StripeSubscriptionStatus = status;
        company.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(
            company,
            AuditAction.BillingSubscriptionUpdated,
            $"Stripe invoice updated subscription status to {status}.",
            cancellationToken);
    }

    private async Task<Company?> FindCompanyForSubscriptionAsync(
        Subscription subscription,
        CancellationToken cancellationToken)
    {
        var companyId = TryGetCompanyId(subscription.Metadata);

        if (companyId.HasValue)
        {
            return await context.Companies.FirstOrDefaultAsync(
                item => item.Id == companyId.Value,
                cancellationToken);
        }

        return await context.Companies.FirstOrDefaultAsync(
            item => item.StripeSubscriptionId == subscription.Id
                || item.StripeCustomerId == subscription.CustomerId,
            cancellationToken);
    }

    private static void ApplySubscription(Company company, Subscription subscription, PlanType? requestedPlan)
    {
        company.StripeCustomerId = subscription.CustomerId ?? company.StripeCustomerId;
        company.StripeSubscriptionId = subscription.Id;
        company.StripeSubscriptionStatus = subscription.Status;
        company.StripeCurrentPeriodEnd = GetCurrentPeriodEnd(subscription);
        company.UpdatedAt = DateTime.UtcNow;

        if (requestedPlan.HasValue && IsActiveSubscription(subscription.Status))
        {
            company.Plan = requestedPlan.Value;
        }
    }

    private static DateTime? GetCurrentPeriodEnd(Subscription subscription)
    {
        return subscription.Items?.Data
            .OrderByDescending(item => item.CurrentPeriodEnd)
            .Select(item => (DateTime?)item.CurrentPeriodEnd)
            .FirstOrDefault();
    }

    private async Task<Company> GetCurrentCompanyAsync(CancellationToken cancellationToken)
    {
        if (currentUserContext.IsSuperAdmin)
        {
            throw new ApiException(403, "Tenant billing is not available to SuperAdmin.");
        }

        var companyId = currentUserContext.RequireCompanyId();
        var company = await context.Companies.FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken);

        if (company is null)
        {
            throw new ApiException(404, "Company not found.", "No company was found for the authenticated tenant.");
        }

        if (!company.IsActive)
        {
            throw new ApiException(403, "Company access is suspended.", "Billing is unavailable while the company is inactive.");
        }

        return company;
    }

    private Task WriteAuditAsync(
        Company company,
        AuditAction action,
        string description,
        CancellationToken cancellationToken)
    {
        return auditLogWriter.WriteAsync(
            null,
            action,
            nameof(Company),
            company.Id.ToString(),
            description,
            cancellationToken,
            company.Id);
    }

    private StripeClient CreateStripeClient()
    {
        ValidateSecretKey();
        return new StripeClient(settings.SecretKey);
    }

    private string GetPriceId(PlanType requestedPlan)
    {
        var priceId = requestedPlan == PlanType.Starter ? settings.StarterPriceId : settings.ProPriceId;

        if (string.IsNullOrWhiteSpace(priceId) || !priceId.StartsWith("price_", StringComparison.Ordinal))
        {
            throw new ApiException(
                503,
                "Stripe price configuration is missing.",
                $"Configure the Stripe Price ID for the {requestedPlan} plan.");
        }

        return priceId;
    }

    private PlanType? GetSubscriptionPlan(Subscription subscription)
    {
        var metadataPlan = TryGetRequestedPaidPlan(subscription.Metadata);

        if (metadataPlan.HasValue)
        {
            return metadataPlan;
        }

        var priceIds = subscription.Items?.Data
            .Select(item => item.Price?.Id)
            .Where(priceId => !string.IsNullOrWhiteSpace(priceId))
            .ToHashSet(StringComparer.Ordinal);

        if (priceIds?.Contains(settings.StarterPriceId) == true)
        {
            return PlanType.Starter;
        }

        if (priceIds?.Contains(settings.ProPriceId) == true)
        {
            return PlanType.Pro;
        }

        return null;
    }

    private string GetPortalReturnUrl()
    {
        if (!Uri.TryCreate(settings.SuccessUrl, UriKind.Absolute, out var successUri))
        {
            throw new ApiException(503, "Stripe URL configuration is invalid.");
        }

        return $"{successUri.Scheme}://{successUri.Authority}/plan";
    }

    private void ValidateCheckoutConfiguration()
    {
        ValidateSecretKey();

        if (!Uri.TryCreate(settings.SuccessUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(settings.CancelUrl, UriKind.Absolute, out _))
        {
            throw new ApiException(
                503,
                "Stripe URL configuration is missing.",
                "Configure valid SuccessUrl and CancelUrl values.");
        }
    }

    private void ValidateSecretKey()
    {
        if (!IsTestKey(settings.SecretKey, "sk_test_"))
        {
            throw new ApiException(
                503,
                "Stripe test configuration is missing.",
                "Configure a valid Stripe test SecretKey.");
        }
    }

    private void ValidateWebhookConfiguration()
    {
        ValidateSecretKey();

        if (!IsTestKey(settings.WebhookSecret, "whsec_"))
        {
            throw new ApiException(
                503,
                "Stripe webhook configuration is missing.",
                "Configure a valid Stripe webhook secret.");
        }
    }

    private static Dictionary<string, string> CreateMetadata(Guid companyId, PlanType requestedPlan)
    {
        return new Dictionary<string, string>
        {
            [CompanyIdMetadataKey] = companyId.ToString(),
            [RequestedPlanMetadataKey] = requestedPlan.ToString()
        };
    }

    private static Guid GetCompanyId(IDictionary<string, string> metadata)
    {
        return TryGetCompanyId(metadata)
            ?? throw new ApiException(400, "Stripe metadata is invalid.", "CompanyId metadata is required.");
    }

    private static Guid? TryGetCompanyId(IDictionary<string, string>? metadata)
    {
        if (metadata is null
            || !metadata.TryGetValue(CompanyIdMetadataKey, out var companyIdValue)
            || !Guid.TryParse(companyIdValue, out var companyId))
        {
            return null;
        }

        return companyId;
    }

    private static PlanType GetRequestedPaidPlan(IDictionary<string, string> metadata)
    {
        return TryGetRequestedPaidPlan(metadata)
            ?? throw new ApiException(400, "Stripe metadata is invalid.", "RequestedPlan metadata is required.");
    }

    private static PlanType? TryGetRequestedPaidPlan(IDictionary<string, string>? metadata)
    {
        if (metadata is null
            || !metadata.TryGetValue(RequestedPlanMetadataKey, out var planValue)
            || !Enum.TryParse<PlanType>(planValue, true, out var requestedPlan)
            || requestedPlan is not (PlanType.Starter or PlanType.Pro))
        {
            return null;
        }

        return requestedPlan;
    }

    private static bool IsActiveSubscription(string? status)
    {
        return status is "active" or "trialing";
    }

    private static bool IsTestKey(string? value, string prefix)
    {
        return !string.IsNullOrWhiteSpace(value) && value.StartsWith(prefix, StringComparison.Ordinal);
    }
}
