using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Billing.DTOs;
using InventorySaaS.Application.Billing.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Notifications.DTOs;
using InventorySaaS.Application.Notifications.Interfaces;
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
    ISubscriptionAccessService subscriptionAccessService,
    IAuditLogWriter auditLogWriter,
    ITenantNotificationWriter tenantNotificationWriter,
    ITenantEmailNotificationService tenantEmailNotificationService,
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
        var access = await subscriptionAccessService.GetAccessAsync(company.Id, cancellationToken);

        return new BillingStatusResponse
        {
            Plan = company.Plan,
            HasStripeCustomer = !string.IsNullOrWhiteSpace(company.StripeCustomerId),
            HasActiveSubscription = IsActiveSubscription(company.StripeSubscriptionStatus),
            SubscriptionStatus = company.StripeSubscriptionStatus,
            CurrentPeriodEnd = company.StripeCurrentPeriodEnd,
            CanManageBilling = !string.IsNullOrWhiteSpace(company.StripeCustomerId),
            AccessLevel = access.Level,
            AccessMessage = access.Message,
            AccessDetail = access.Detail
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

        if (await HasProcessedWebhookEventAsync(stripeEvent.Id, cancellationToken))
        {
            logger.LogInformation(
                "Ignoring previously processed Stripe webhook EventId {EventId}, Type {EventType}.",
                stripeEvent.Id,
                stripeEvent.Type);
            return;
        }

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed" when stripeEvent.Data.Object is Session session:
                await HandleCheckoutCompletedAsync(session, stripeEvent.Id, stripeEvent.Type, cancellationToken);
                break;
            case "customer.subscription.created" when stripeEvent.Data.Object is Subscription createdSubscription:
                await HandleSubscriptionUpdatedAsync(
                    createdSubscription,
                    stripeEvent.Id,
                    stripeEvent.Type,
                    cancellationToken);
                break;
            case "customer.subscription.updated" when stripeEvent.Data.Object is Subscription updatedSubscription:
                await HandleSubscriptionUpdatedAsync(
                    updatedSubscription,
                    stripeEvent.Id,
                    stripeEvent.Type,
                    cancellationToken);
                break;
            case "customer.subscription.deleted" when stripeEvent.Data.Object is Subscription deletedSubscription:
                await HandleSubscriptionDeletedAsync(
                    deletedSubscription,
                    stripeEvent.Id,
                    stripeEvent.Type,
                    cancellationToken);
                break;
            case "invoice.payment_succeeded" when stripeEvent.Data.Object is Invoice paidInvoice:
                await HandleInvoiceStatusAsync(
                    paidInvoice.CustomerId,
                    "active",
                    AuditAction.BillingPaymentSucceeded,
                    stripeEvent.Id,
                    stripeEvent.Type,
                    cancellationToken);
                break;
            case "invoice.payment_failed" when stripeEvent.Data.Object is Invoice failedInvoice:
                await HandleInvoiceStatusAsync(
                    failedInvoice.CustomerId,
                    "past_due",
                    AuditAction.BillingPaymentFailed,
                    stripeEvent.Id,
                    stripeEvent.Type,
                    cancellationToken);
                break;
        }
    }

    private async Task HandleCheckoutCompletedAsync(
        Session session,
        string eventId,
        string eventType,
        CancellationToken cancellationToken)
    {
        var metadata = session.Metadata;
        var companyId = GetCompanyId(metadata);
        var requestedPlan = GetRequestedPaidPlan(metadata);
        var company = await context.Companies.FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken)
            ?? throw new ApiException(404, "Company not found.", "The Stripe Checkout company does not exist.");
        var previousState = CaptureBillingState(company);

        company.StripeCustomerId = session.CustomerId ?? company.StripeCustomerId;
        company.StripeSubscriptionId = session.SubscriptionId ?? company.StripeSubscriptionId;
        company.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(company.StripeSubscriptionId))
        {
            var subscription = await new SubscriptionService(CreateStripeClient())
                .GetAsync(company.StripeSubscriptionId, cancellationToken: cancellationToken);

            ApplySubscription(company, subscription, requestedPlan);
        }

        LogResolvedWebhook(eventType, eventId, company);

        if (previousState != CaptureBillingState(company))
        {
            await context.SaveChangesAsync(cancellationToken);
        }

        await WriteAuditAsync(
            company,
            AuditAction.BillingCheckoutCompleted,
            $"Stripe checkout completed for {requestedPlan}.",
            eventId,
            cancellationToken);

        await WriteStatusChangeAuditIfNeededAsync(company, previousState.Status, eventId, cancellationToken);

        if (previousState.Plan != company.Plan)
        {
            await WriteAuditAsync(
                company,
                AuditAction.PlanChangedByStripe,
                $"Plan changed by Stripe: {previousState.Plan} -> {company.Plan}.",
                eventId,
                cancellationToken);
            await WritePlanChangedNotificationAsync(company, previousState.Plan, cancellationToken);
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(
        Subscription subscription,
        string eventId,
        string eventType,
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

        var previousState = CaptureBillingState(company);
        var requestedPlan = GetSubscriptionPlan(subscription);

        ApplySubscription(company, subscription, requestedPlan);
        LogResolvedWebhook(eventType, eventId, company);

        if (previousState == CaptureBillingState(company))
        {
            logger.LogInformation(
                "Stripe webhook caused no billing state changes for CompanyId {CompanyId}, EventId {EventId}.",
                company.Id,
                eventId);
            return;
        }

        await context.SaveChangesAsync(cancellationToken);
        await WriteStatusChangeAuditIfNeededAsync(company, previousState.Status, eventId, cancellationToken);

        if (IsCancelledSubscription(company.StripeSubscriptionStatus)
            && !IsCancelledSubscription(previousState.Status))
        {
            await WriteAuditAsync(
                company,
                AuditAction.BillingSubscriptionCancelled,
                $"Stripe subscription cancelled. Previous plan: {previousState.Plan}.",
                eventId,
                cancellationToken);
            await WriteTenantNotificationAsync(
                company,
                TenantNotificationType.BillingSubscriptionCancelled,
                TenantNotificationSeverity.Warning,
                "Suscripción cancelada",
                "La suscripción Stripe fue cancelada. Revisa el plan actual y las opciones disponibles.",
                cancellationToken);
            await tenantEmailNotificationService.SendBillingSubscriptionCancelledAsync(
                company.Id,
                GetCompanyEmail(company),
                GetCompanyName(company),
                cancellationToken);
        }
        else if (string.Equals(previousState.Status, company.StripeSubscriptionStatus, StringComparison.OrdinalIgnoreCase))
        {
            await WriteAuditAsync(
                company,
                AuditAction.BillingSubscriptionUpdated,
                $"Stripe subscription details updated with status {company.StripeSubscriptionStatus}.",
                eventId,
                cancellationToken);
        }

        if (previousState.Plan != company.Plan)
        {
            await WriteAuditAsync(
                company,
                AuditAction.PlanChangedByStripe,
                $"Plan changed by Stripe: {previousState.Plan} -> {company.Plan}.",
                eventId,
                cancellationToken);
            await WritePlanChangedNotificationAsync(company, previousState.Plan, cancellationToken);
        }
    }

    private async Task HandleSubscriptionDeletedAsync(
        Subscription subscription,
        string eventId,
        string eventType,
        CancellationToken cancellationToken)
    {
        var company = await FindCompanyForSubscriptionAsync(subscription, cancellationToken);

        if (company is null)
        {
            return;
        }

        var previousState = CaptureBillingState(company);
        ApplySubscription(company, subscription, GetSubscriptionPlan(subscription), "cancelled");
        LogResolvedWebhook(eventType, eventId, company);

        if (previousState == CaptureBillingState(company))
        {
            logger.LogInformation(
                "Stripe cancellation webhook caused no billing state changes for CompanyId {CompanyId}, EventId {EventId}.",
                company.Id,
                eventId);
            return;
        }

        await context.SaveChangesAsync(cancellationToken);
        await WriteStatusChangeAuditIfNeededAsync(company, previousState.Status, eventId, cancellationToken);
        if (!IsCancelledSubscription(previousState.Status))
        {
            await WriteAuditAsync(
                company,
                AuditAction.BillingSubscriptionCancelled,
                $"Stripe subscription cancelled. Previous plan: {previousState.Plan}.",
                eventId,
                cancellationToken);
            await WriteTenantNotificationAsync(
                company,
                TenantNotificationType.BillingSubscriptionCancelled,
                TenantNotificationSeverity.Warning,
                "Suscripción cancelada",
                "La suscripción Stripe fue cancelada. Tu empresa puede contratar nuevamente cuando lo necesite.",
                cancellationToken);
            await tenantEmailNotificationService.SendBillingSubscriptionCancelledAsync(
                company.Id,
                GetCompanyEmail(company),
                GetCompanyName(company),
                cancellationToken);
        }

        if (previousState.Plan != company.Plan)
        {
            await WriteAuditAsync(
                company,
                AuditAction.PlanChangedByStripe,
                $"Plan changed by Stripe: {previousState.Plan} -> {company.Plan}.",
                eventId,
                cancellationToken);
            await WritePlanChangedNotificationAsync(company, previousState.Plan, cancellationToken);
        }
    }

    private async Task HandleInvoiceStatusAsync(
        string? customerId,
        string status,
        AuditAction paymentAction,
        string eventId,
        string eventType,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(customerId))
        {
            return;
        }

        var company = await context.Companies.FirstOrDefaultAsync(
            item => item.StripeCustomerId == customerId,
            cancellationToken);

        if (company is null)
        {
            logger.LogWarning(
                "No company found for Stripe invoice webhook EventId {EventId}, Type {EventType}, CustomerId {CustomerId}.",
                eventId,
                eventType,
                customerId);
            return;
        }

        var previousStatus = company.StripeSubscriptionStatus;
        var normalizedStatus = NormalizeSubscriptionStatus(status);
        LogResolvedWebhook(eventType, eventId, company);

        if (!string.Equals(previousStatus, normalizedStatus, StringComparison.OrdinalIgnoreCase))
        {
            company.StripeSubscriptionStatus = normalizedStatus;
            company.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);
        }

        await WriteAuditAsync(
            company,
            paymentAction,
            paymentAction == AuditAction.BillingPaymentSucceeded
                ? "Stripe payment succeeded."
                : "Stripe payment failed.",
            eventId,
            cancellationToken);
        await WriteStatusChangeAuditIfNeededAsync(company, previousStatus, eventId, cancellationToken);
        await WriteTenantNotificationAsync(
            company,
            paymentAction == AuditAction.BillingPaymentSucceeded
                ? TenantNotificationType.BillingPaymentSucceeded
                : TenantNotificationType.BillingPaymentFailed,
            paymentAction == AuditAction.BillingPaymentSucceeded
                ? TenantNotificationSeverity.Success
                : TenantNotificationSeverity.Danger,
            paymentAction == AuditAction.BillingPaymentSucceeded
                ? "Pago procesado correctamente"
                : "No se pudo procesar el pago",
            paymentAction == AuditAction.BillingPaymentSucceeded
                ? "Stripe confirmó el pago de la suscripción de tu empresa."
                : "Stripe reportó un pago fallido. Gestiona la facturación para evitar interrupciones.",
            cancellationToken);
        if (paymentAction == AuditAction.BillingPaymentSucceeded)
        {
            await tenantEmailNotificationService.SendBillingPaymentSucceededAsync(
                company.Id,
                GetCompanyEmail(company),
                GetCompanyName(company),
                cancellationToken);
        }
        else
        {
            await tenantEmailNotificationService.SendBillingPaymentFailedAsync(
                company.Id,
                GetCompanyEmail(company),
                GetCompanyName(company),
                cancellationToken);
        }
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

    private static void ApplySubscription(
        Company company,
        Subscription subscription,
        PlanType? requestedPlan,
        string? forcedStatus = null)
    {
        var normalizedStatus = NormalizeSubscriptionStatus(forcedStatus ?? subscription.Status);
        company.StripeCustomerId = subscription.CustomerId ?? company.StripeCustomerId;
        company.StripeSubscriptionId = subscription.Id;
        company.StripeSubscriptionStatus = normalizedStatus;
        company.StripeCurrentPeriodEnd = GetCurrentPeriodEnd(subscription);
        company.UpdatedAt = DateTime.UtcNow;

        if (IsCancelledSubscription(normalizedStatus) && company.Plan is PlanType.Starter or PlanType.Pro)
        {
            company.Plan = PlanType.Free;
        }
        else if (requestedPlan.HasValue
            && IsActiveSubscription(normalizedStatus)
            && company.Plan != PlanType.Enterprise)
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
        string eventId,
        CancellationToken cancellationToken)
    {
        return auditLogWriter.WriteAsync(
            null,
            action,
            "StripeBilling",
            eventId,
            description,
            cancellationToken,
            company.Id);
    }

    private Task<bool> HasProcessedWebhookEventAsync(string eventId, CancellationToken cancellationToken)
    {
        return context.AuditLogs.AnyAsync(
            auditLog => auditLog.EntityName == "StripeBilling" && auditLog.EntityId == eventId,
            cancellationToken);
    }

    private async Task WriteStatusChangeAuditIfNeededAsync(
        Company company,
        string? previousStatus,
        string eventId,
        CancellationToken cancellationToken)
    {
        if (string.Equals(previousStatus, company.StripeSubscriptionStatus, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        await WriteAuditAsync(
            company,
            AuditAction.BillingSubscriptionStatusChanged,
            $"Stripe subscription status changed: {previousStatus ?? "none"} -> {company.StripeSubscriptionStatus ?? "none"}.",
            eventId,
            cancellationToken);
    }

    private void LogResolvedWebhook(string eventType, string eventId, Company company)
    {
        logger.LogInformation(
            "Resolved Stripe webhook EventId {EventId}, Type {EventType}, CustomerId {CustomerId}, SubscriptionId {SubscriptionId}, CompanyId {CompanyId}.",
            eventId,
            eventType,
            company.StripeCustomerId,
            company.StripeSubscriptionId,
            company.Id);
    }

    private async Task WritePlanChangedNotificationAsync(
        Company company,
        PlanType previousPlan,
        CancellationToken cancellationToken)
    {
        await WriteTenantNotificationAsync(
            company,
            TenantNotificationType.PlanUpdatedByStripe,
            TenantNotificationSeverity.Success,
            "Plan actualizado",
            $"Stripe actualizó el plan de tu empresa: {previousPlan} -> {company.Plan}.",
            cancellationToken);
        await tenantEmailNotificationService.SendPlanChangedByStripeAsync(
            company.Id,
            GetCompanyEmail(company),
            GetCompanyName(company),
            previousPlan,
            company.Plan,
            cancellationToken);
    }

    private Task WriteTenantNotificationAsync(
        Company company,
        TenantNotificationType type,
        TenantNotificationSeverity severity,
        string title,
        string message,
        CancellationToken cancellationToken)
    {
        return tenantNotificationWriter.WriteAsync(
            new CreateTenantNotificationRequest
            {
                CompanyId = company.Id,
                Title = title,
                Message = message,
                Type = type,
                Severity = severity,
                ActionUrl = "/plan"
            },
            cancellationToken);
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

    private static bool IsCancelledSubscription(string? status)
    {
        return string.Equals(status, "cancelled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "canceled", StringComparison.OrdinalIgnoreCase);
    }

    private static string? NormalizeSubscriptionStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return null;
        }

        return IsCancelledSubscription(status)
            ? "cancelled"
            : status.Trim().ToLowerInvariant();
    }

    private static BillingState CaptureBillingState(Company company)
    {
        return new BillingState(
            company.StripeCustomerId,
            company.StripeSubscriptionId,
            company.StripeSubscriptionStatus,
            company.StripeCurrentPeriodEnd,
            company.Plan);
    }

    private static string? GetCompanyEmail(Company company)
    {
        return company.ContactEmail ?? company.Email;
    }

    private static string GetCompanyName(Company company)
    {
        return company.CommercialName ?? company.Name;
    }

    private static bool IsTestKey(string? value, string prefix)
    {
        return !string.IsNullOrWhiteSpace(value) && value.StartsWith(prefix, StringComparison.Ordinal);
    }

    private sealed record BillingState(
        string? CustomerId,
        string? SubscriptionId,
        string? Status,
        DateTime? CurrentPeriodEnd,
        PlanType Plan);
}
