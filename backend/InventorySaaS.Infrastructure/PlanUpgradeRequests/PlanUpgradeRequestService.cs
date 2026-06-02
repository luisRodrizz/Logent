using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.PlanUpgradeRequests.DTOs;
using InventorySaaS.Application.PlanUpgradeRequests.Interfaces;
using InventorySaaS.Application.Platform.Notifications.DTOs;
using InventorySaaS.Application.Platform.Notifications.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.PlanUpgradeRequests;

public class PlanUpgradeRequestService(
    ApplicationDbContext context,
    IAuditLogWriter auditLogWriter,
    IPlatformNotificationWriter platformNotificationWriter) : IPlanUpgradeRequestService
{
    public async Task<PlanUpgradeRequestResponse> CreateTenantRequestAsync(
        Guid companyId,
        string currentUserId,
        CreatePlanUpgradeRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies
            .FirstOrDefaultAsync(company => company.Id == companyId, cancellationToken);

        if (company is null)
        {
            throw new ApiException(404, "Company not found.", "No company was found for the authenticated user.");
        }

        if (!company.IsActive)
        {
            throw new ApiException(
                403,
                "Company access is suspended.",
                "Contact the platform administrator to reactivate this company.");
        }

        if (request.RequestedPlan <= company.Plan)
        {
            throw new ApiException(
                400,
                "Select a higher plan.",
                "Plan upgrade requests must target a plan above the company's current plan.");
        }

        var hasPendingRequest = await context.PlanUpgradeRequests.AnyAsync(
            upgradeRequest =>
                upgradeRequest.CompanyId == companyId
                && upgradeRequest.Status == PlanUpgradeRequestStatus.Pending,
            cancellationToken);

        if (hasPendingRequest)
        {
            throw new ApiException(
                400,
                "Your company already has a pending plan upgrade request.",
                "Wait for the platform administrator to resolve the existing request before creating another one.");
        }

        var upgradeRequest = new PlanUpgradeRequest
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            CurrentPlan = company.Plan,
            RequestedPlan = request.RequestedPlan,
            Status = PlanUpgradeRequestStatus.Pending,
            Message = NormalizeOptionalText(request.Message),
            RequestedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        context.PlanUpgradeRequests.Add(upgradeRequest);
        await context.SaveChangesAsync(cancellationToken);

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.PlanUpgradeRequested,
            nameof(PlanUpgradeRequest),
            upgradeRequest.Id.ToString(),
            $"Plan upgrade requested: {company.Plan} -> {upgradeRequest.RequestedPlan}.",
            cancellationToken,
            companyId);

        await platformNotificationWriter.WriteAsync(
            new CreatePlatformNotificationRequest
            {
                Title = "Nueva solicitud de actualización",
                Message = $"La empresa {company.Name} solicitó cambiar de {company.Plan} a {upgradeRequest.RequestedPlan}.",
                Type = PlatformNotificationType.UpgradeRequestCreated,
                Severity = PlatformNotificationSeverity.Warning,
                CompanyId = company.Id,
                RelatedEntityName = nameof(PlanUpgradeRequest),
                RelatedEntityId = upgradeRequest.Id.ToString(),
                ActionUrl = $"/platform/upgrade-requests/{upgradeRequest.Id}"
            },
            cancellationToken);

        return MapTenantResponse(upgradeRequest);
    }

    public async Task<PlanUpgradeRequestResponse?> GetMyLatestAsync(
        Guid companyId,
        CancellationToken cancellationToken = default)
    {
        var request = await context.PlanUpgradeRequests
            .AsNoTracking()
            .Where(request => request.CompanyId == companyId)
            .OrderByDescending(request => request.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return request is null ? null : MapTenantResponse(request);
    }

    public Task<PagedResponse<PlatformPlanUpgradeRequestListItemResponse>> GetPlatformRequestsAsync(
        PlatformPlanUpgradeRequestQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = BuildPlatformQuery(request)
            .OrderByDescending(upgradeRequest => upgradeRequest.CreatedAt)
            .Select(upgradeRequest => new PlatformPlanUpgradeRequestListItemResponse
            {
                Id = upgradeRequest.Id,
                CompanyId = upgradeRequest.CompanyId,
                CompanyName = upgradeRequest.Company.Name,
                CurrentPlan = upgradeRequest.CurrentPlan,
                RequestedPlan = upgradeRequest.RequestedPlan,
                Status = upgradeRequest.Status,
                Message = upgradeRequest.Message,
                RequestedByName = context.Users
                    .Where(user => user.Id == upgradeRequest.RequestedByUserId)
                    .Select(user => (user.FirstName + " " + user.LastName).Trim())
                    .FirstOrDefault() ?? upgradeRequest.RequestedByUserId,
                CreatedAt = upgradeRequest.CreatedAt,
                ResolvedAt = upgradeRequest.ResolvedAt
            });

        return query.ToPagedResponseAsync(request, cancellationToken);
    }

    public Task<PlatformPlanUpgradeRequestDetailResponse?> GetPlatformDetailAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return context.PlanUpgradeRequests
            .AsNoTracking()
            .Where(upgradeRequest => upgradeRequest.Id == id)
            .Select(upgradeRequest => new PlatformPlanUpgradeRequestDetailResponse
            {
                Id = upgradeRequest.Id,
                CompanyId = upgradeRequest.CompanyId,
                CompanyName = upgradeRequest.Company.Name,
                CurrentPlan = upgradeRequest.CurrentPlan,
                RequestedPlan = upgradeRequest.RequestedPlan,
                Status = upgradeRequest.Status,
                Message = upgradeRequest.Message,
                RequestedByName = context.Users
                    .Where(user => user.Id == upgradeRequest.RequestedByUserId)
                    .Select(user => (user.FirstName + " " + user.LastName).Trim())
                    .FirstOrDefault() ?? upgradeRequest.RequestedByUserId,
                RequestedByUserId = upgradeRequest.RequestedByUserId,
                ResolutionNote = upgradeRequest.ResolutionNote,
                ResolvedByName = context.Users
                    .Where(user => user.Id == upgradeRequest.ResolvedByUserId)
                    .Select(user => (user.FirstName + " " + user.LastName).Trim())
                    .FirstOrDefault(),
                ResolvedByUserId = upgradeRequest.ResolvedByUserId,
                CreatedAt = upgradeRequest.CreatedAt,
                ResolvedAt = upgradeRequest.ResolvedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<bool> ApproveAsync(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        return ResolveAsync(id, request, currentUserId, PlanUpgradeRequestStatus.Approved, cancellationToken);
    }

    public Task<bool> RejectAsync(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        return ResolveAsync(id, request, currentUserId, PlanUpgradeRequestStatus.Rejected, cancellationToken);
    }

    private IQueryable<PlanUpgradeRequest> BuildPlatformQuery(PlatformPlanUpgradeRequestQueryRequest request)
    {
        var query = context.PlanUpgradeRequests.AsNoTracking();
        var companySearch = request.NormalizeCompanySearch();

        if (companySearch is not null)
        {
            query = query.Where(
                upgradeRequest =>
                    upgradeRequest.Company.Name.ToLower().Contains(companySearch)
                    || upgradeRequest.Company.Slug.ToLower().Contains(companySearch));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(upgradeRequest => upgradeRequest.Status == request.Status.Value);
        }

        if (request.RequestedPlan.HasValue)
        {
            query = query.Where(upgradeRequest => upgradeRequest.RequestedPlan == request.RequestedPlan.Value);
        }

        return query;
    }

    private async Task<bool> ResolveAsync(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        string currentUserId,
        PlanUpgradeRequestStatus resolution,
        CancellationToken cancellationToken)
    {
        var upgradeRequest = await context.PlanUpgradeRequests
            .Include(request => request.Company)
            .FirstOrDefaultAsync(request => request.Id == id, cancellationToken);

        if (upgradeRequest is null)
        {
            return false;
        }

        if (upgradeRequest.Status != PlanUpgradeRequestStatus.Pending)
        {
            throw new ApiException(
                400,
                "Plan upgrade request has already been resolved.",
                "Only pending requests can be approved or rejected.");
        }

        upgradeRequest.Status = resolution;
        upgradeRequest.ResolutionNote = NormalizeOptionalText(request.ResolutionNote);
        upgradeRequest.ResolvedByUserId = currentUserId;
        upgradeRequest.ResolvedAt = DateTime.UtcNow;

        if (resolution == PlanUpgradeRequestStatus.Approved)
        {
            upgradeRequest.Company.Plan = upgradeRequest.RequestedPlan;
            upgradeRequest.Company.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync(cancellationToken);

        await auditLogWriter.WriteAsync(
            currentUserId,
            resolution == PlanUpgradeRequestStatus.Approved
                ? AuditAction.PlanUpgradeApproved
                : AuditAction.PlanUpgradeRejected,
            nameof(PlanUpgradeRequest),
            upgradeRequest.Id.ToString(),
            $"Plan upgrade request {resolution.ToString().ToLowerInvariant()}: {upgradeRequest.CurrentPlan} -> {upgradeRequest.RequestedPlan}.",
            cancellationToken,
            upgradeRequest.CompanyId);

        await platformNotificationWriter.WriteAsync(
            new CreatePlatformNotificationRequest
            {
                Title = resolution == PlanUpgradeRequestStatus.Approved
                    ? "Solicitud de actualización aprobada"
                    : "Solicitud de actualización rechazada",
                Message = $"La solicitud de {upgradeRequest.Company.Name} para cambiar de {upgradeRequest.CurrentPlan} a {upgradeRequest.RequestedPlan} fue {(resolution == PlanUpgradeRequestStatus.Approved ? "aprobada" : "rechazada")}.",
                Type = resolution == PlanUpgradeRequestStatus.Approved
                    ? PlatformNotificationType.UpgradeRequestApproved
                    : PlatformNotificationType.UpgradeRequestRejected,
                Severity = resolution == PlanUpgradeRequestStatus.Approved
                    ? PlatformNotificationSeverity.Success
                    : PlatformNotificationSeverity.Info,
                CompanyId = upgradeRequest.CompanyId,
                RelatedEntityName = nameof(PlanUpgradeRequest),
                RelatedEntityId = upgradeRequest.Id.ToString(),
                ActionUrl = $"/platform/upgrade-requests/{upgradeRequest.Id}"
            },
            cancellationToken);

        return true;
    }

    private static PlanUpgradeRequestResponse MapTenantResponse(PlanUpgradeRequest request)
    {
        return new PlanUpgradeRequestResponse
        {
            Id = request.Id,
            CurrentPlan = request.CurrentPlan,
            RequestedPlan = request.RequestedPlan,
            Status = request.Status,
            Message = request.Message,
            ResolutionNote = request.ResolutionNote,
            CreatedAt = request.CreatedAt,
            ResolvedAt = request.ResolvedAt
        };
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
