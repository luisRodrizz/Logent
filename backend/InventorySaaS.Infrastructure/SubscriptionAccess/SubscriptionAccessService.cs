using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.SubscriptionAccess;

public class SubscriptionAccessService(ApplicationDbContext context) : ISubscriptionAccessService
{
    public async Task<SubscriptionAccessDecision> GetAccessAsync(
        Guid companyId,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies
            .AsNoTracking()
            .Where(company => company.Id == companyId)
            .Select(company => new
            {
                company.IsActive,
                company.Plan,
                company.StripeCurrentPeriodEnd,
                company.StripeSubscriptionStatus
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new ApiException(
                404,
                "Company not found.",
                "No company was found for the authenticated tenant.");

        if (!company.IsActive)
        {
            return new SubscriptionAccessDecision(
                SubscriptionAccessLevel.BlockedAccess,
                company.Plan,
                "La empresa asociada a tu cuenta se encuentra suspendida.",
                "Contacta al administrador de LOGENT para recuperar el acceso.");
        }

        var status = NormalizeStatus(company.StripeSubscriptionStatus);

        if (company.Plan == PlanType.Free || IsCancelled(status))
        {
            return Active(PlanType.Free);
        }

        if (string.IsNullOrWhiteSpace(status) || status is "active" or "trialing")
        {
            return Active(company.Plan);
        }

        if (status == "past_due" && company.StripeCurrentPeriodEnd > DateTime.UtcNow)
        {
            return new SubscriptionAccessDecision(
                SubscriptionAccessLevel.GracePeriod,
                company.Plan,
                "Tu suscripción requiere atención. Actualiza tu facturación para continuar.",
                "El acceso de lectura continúa disponible durante el periodo de gracia.");
        }

        if (status is "past_due" or "incomplete" or "paused")
        {
            return new SubscriptionAccessDecision(
                SubscriptionAccessLevel.LimitedAccess,
                company.Plan,
                "Tu suscripción requiere atención. Actualiza tu facturación para continuar.",
                "Las consultas siguen disponibles, pero las acciones críticas están temporalmente restringidas.");
        }

        return new SubscriptionAccessDecision(
            SubscriptionAccessLevel.BlockedAccess,
            company.Plan,
            "Tu suscripción se encuentra impaga. Gestiona tu facturación para continuar.",
            "Las acciones críticas permanecerán bloqueadas hasta regularizar la suscripción.");
    }

    public async Task EnsureCanPerformCriticalWriteAsync(
        Guid companyId,
        CancellationToken cancellationToken = default)
    {
        var decision = await GetAccessAsync(companyId, cancellationToken);

        if (decision.CanPerformCriticalWrites)
        {
            return;
        }

        throw new ApiException(403, decision.Message, decision.Detail);
    }

    private static SubscriptionAccessDecision Active(PlanType plan)
    {
        return new SubscriptionAccessDecision(
            SubscriptionAccessLevel.ActiveAccess,
            plan,
            "Tu suscripción permite operar con normalidad.",
            "Las acciones disponibles se rigen por los límites del plan actual.");
    }

    private static bool IsCancelled(string? status)
    {
        return status is "cancelled" or "canceled";
    }

    private static string? NormalizeStatus(string? status)
    {
        return string.IsNullOrWhiteSpace(status) ? null : status.Trim().ToLowerInvariant();
    }
}
