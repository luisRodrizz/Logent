using System.Net;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Notifications.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Email;

public class TenantEmailNotificationService(
    IEmailSender emailSender,
    IOptions<AppUrlSettings> appUrlSettings,
    ILogger<TenantEmailNotificationService> logger) : ITenantEmailNotificationService
{
    private readonly AppUrlSettings urls = appUrlSettings.Value;

    public Task SendBillingPaymentSucceededAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        CancellationToken cancellationToken = default)
    {
        return SendSafelyAsync(
            companyId,
            recipient,
            "BillingPaymentSucceeded",
            "Pago de suscripción confirmado",
            CreateTemplate(
                "Pago procesado correctamente",
                $"Stripe confirmó el pago de la suscripción de {Encode(companyName)}.",
                "Revisar plan y facturación",
                "/plan"),
            cancellationToken);
    }

    public Task SendBillingPaymentFailedAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        CancellationToken cancellationToken = default)
    {
        return SendSafelyAsync(
            companyId,
            recipient,
            "BillingPaymentFailed",
            "Acción requerida: pago de suscripción pendiente",
            CreateTemplate(
                "No pudimos procesar el pago",
                $"Stripe reportó un pago fallido para {Encode(companyName)}. Revisa el método de pago para evitar interrupciones.",
                "Gestionar facturación",
                "/plan"),
            cancellationToken);
    }

    public Task SendBillingSubscriptionCancelledAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        CancellationToken cancellationToken = default)
    {
        return SendSafelyAsync(
            companyId,
            recipient,
            "BillingSubscriptionCancelled",
            "Suscripción de LOGENT cancelada",
            CreateTemplate(
                "Suscripción cancelada",
                $"La suscripción Stripe de {Encode(companyName)} fue cancelada. Puedes revisar el plan actual y contratar nuevamente desde LOGENT.",
                "Revisar plan",
                "/plan"),
            cancellationToken);
    }

    public Task SendPlanChangedByStripeAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        PlanType previousPlan,
        PlanType currentPlan,
        CancellationToken cancellationToken = default)
    {
        return SendSafelyAsync(
            companyId,
            recipient,
            "PlanChangedByStripe",
            "Plan de LOGENT actualizado",
            CreateTemplate(
                "Plan actualizado",
                $"Stripe actualizó el plan de {Encode(companyName)}: <strong>{previousPlan}</strong> → <strong>{currentPlan}</strong>.",
                "Ver plan y uso",
                "/plan"),
            cancellationToken);
    }

    public Task SendUpgradeRequestResolvedAsync(
        Guid companyId,
        string? recipient,
        string companyName,
        PlanType requestedPlan,
        bool approved,
        CancellationToken cancellationToken = default)
    {
        return SendSafelyAsync(
            companyId,
            recipient,
            approved ? "UpgradeApproved" : "UpgradeRejected",
            approved ? "Solicitud de actualización aprobada" : "Solicitud de actualización rechazada",
            CreateTemplate(
                approved ? "Actualización de plan aprobada" : "Actualización de plan rechazada",
                approved
                    ? $"La solicitud de {Encode(companyName)} para usar el plan <strong>{requestedPlan}</strong> fue aprobada."
                    : $"La solicitud de {Encode(companyName)} para usar el plan <strong>{requestedPlan}</strong> fue rechazada. Revisa el detalle desde tu panel.",
                "Revisar solicitud",
                "/plan"),
            cancellationToken);
    }

    public Task SendPasswordChangedAsync(
        Guid companyId,
        string? recipient,
        string displayName,
        CancellationToken cancellationToken = default)
    {
        return SendSafelyAsync(
            companyId,
            recipient,
            "PasswordChanged",
            "Tu contraseña de LOGENT fue actualizada",
            CreateTemplate(
                "Contraseña actualizada",
                $"Hola, {Encode(displayName)}. La contraseña de tu cuenta fue cambiada correctamente. Si no reconoces esta acción, contacta al administrador de tu empresa.",
                "Ir a LOGENT",
                "/login"),
            cancellationToken);
    }

    private async Task SendSafelyAsync(
        Guid companyId,
        string? recipient,
        string eventName,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(recipient))
        {
            logger.LogWarning(
                "Tenant email skipped because recipient is missing. Event {EventName}, CompanyId {CompanyId}.",
                eventName,
                companyId);
            return;
        }

        try
        {
            await emailSender.SendEmailAsync(recipient.Trim(), subject, htmlBody, cancellationToken);

            logger.LogInformation(
                "Tenant email sent. Event {EventName}, CompanyId {CompanyId}, RecipientDomain {RecipientDomain}.",
                eventName,
                companyId,
                GetRecipientDomain(recipient));
        }
        catch (Exception exception)
        {
            logger.LogWarning(
                exception,
                "Tenant email delivery failed without interrupting the primary operation. Event {EventName}, CompanyId {CompanyId}, RecipientDomain {RecipientDomain}.",
                eventName,
                companyId,
                GetRecipientDomain(recipient));
        }
    }

    private string CreateTemplate(string title, string message, string actionLabel, string relativeUrl)
    {
        var actionUrl = BuildFrontendUrl(relativeUrl);

        return $"""
            <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
                <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;">
                    <p style="margin:0 0 18px;color:#1017d8;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">LOGENT</p>
                    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">{title}</h1>
                    <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">{message}</p>
                    <p style="margin:24px 0 0;">
                        <a href="{Encode(actionUrl)}" style="display:inline-block;border-radius:6px;background:#1017d8;color:#ffffff;padding:11px 16px;text-decoration:none;font-size:14px;font-weight:700;">
                            {actionLabel}
                        </a>
                    </p>
                    <p style="margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:16px;color:#94a3b8;font-size:12px;line-height:1.5;">
                        Este correo fue generado automáticamente por LOGENT.
                    </p>
                </div>
            </div>
            """;
    }

    private string BuildFrontendUrl(string relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(urls.FrontendBaseUrl))
        {
            return relativeUrl;
        }

        return $"{urls.FrontendBaseUrl.TrimEnd('/')}/{relativeUrl.TrimStart('/')}";
    }

    private static string Encode(string value)
    {
        return WebUtility.HtmlEncode(value);
    }

    private static string GetRecipientDomain(string recipient)
    {
        var separatorIndex = recipient.LastIndexOf('@');

        return separatorIndex >= 0 && separatorIndex < recipient.Length - 1
            ? recipient[(separatorIndex + 1)..]
            : "unknown";
    }
}
