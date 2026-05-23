using InventorySaaS.Application.AuditLogs.DTOs;
using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.AuditLogs;

public class AuditLogService(ApplicationDbContext context) : IAuditLogService
{
    public async Task<PagedResponse<AuditLogResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = GetAuditLogsQuery();
        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                auditLog =>
                    (auditLog.UserId != null && auditLog.UserId.ToLower().Contains(search))
                    || auditLog.EntityName.ToLower().Contains(search)
                    || (auditLog.EntityId != null && auditLog.EntityId.ToLower().Contains(search))
                    || auditLog.Description.ToLower().Contains(search));
        }

        return await query
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToPagedResponseAsync(request, cancellationToken);
    }

    public async Task<AuditLogResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await GetAuditLogsQuery()
            .Where(auditLog => auditLog.Id == id)
            .Select(auditLog => MapToResponse(auditLog))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetByUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return [];
        }

        var normalizedUserId = userId.Trim();

        return await GetAuditLogsQuery()
            .Where(auditLog => auditLog.UserId == normalizedUserId)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetByEntityAsync(
        string entityName,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(entityName))
        {
            return [];
        }

        var normalizedEntityName = entityName.Trim().ToLower();

        return await GetAuditLogsQuery()
            .Where(auditLog => auditLog.EntityName.ToLower() == normalizedEntityName)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetByActionAsync(
        AuditAction action,
        CancellationToken cancellationToken = default)
    {
        return await GetAuditLogsQuery()
            .Where(auditLog => auditLog.Action == action)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);
    }

    private IQueryable<AuditLog> GetAuditLogsQuery()
    {
        return context.AuditLogs.AsNoTracking();
    }

    private static AuditLogResponse MapToResponse(AuditLog auditLog)
    {
        return new AuditLogResponse
        {
            Id = auditLog.Id,
            UserId = auditLog.UserId,
            Action = auditLog.Action,
            EntityName = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            Description = auditLog.Description,
            CreatedAt = auditLog.CreatedAt
        };
    }
}
