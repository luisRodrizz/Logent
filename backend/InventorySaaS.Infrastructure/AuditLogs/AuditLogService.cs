using InventorySaaS.Application.AuditLogs.DTOs;
using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;

namespace InventorySaaS.Infrastructure.AuditLogs;

public class AuditLogService(ApplicationDbContext context, ICurrentUserContext currentUserContext) : IAuditLogService
{
    private static readonly Regex SensitiveFieldRegex = new(
        "(?<key>\"?(?:password|currentPassword|newPassword|token|secret|apiSecret|signature|api_key)\"?\\s*[:=]\\s*)\"?[^\",}\\r\\n]+\"?",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public async Task<PagedResponse<AuditLogResponse>> GetAllAsync(
        AuditLogFilterRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var query = ApplyFilters(GetAuditLogsQuery(companyId), request);

        return await query
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToPagedResponseAsync(request, cancellationToken);
    }

    public async Task<AuditLogResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetAuditLogsQuery(companyId)
            .Where(auditLog => auditLog.Id == id)
            .Select(auditLog => MapToResponse(auditLog))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<string> ExportCsvAsync(
        AuditLogFilterRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        var auditLogs = await ApplyFilters(GetAuditLogsQuery(companyId), request)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Fecha,Usuario,Accion,Entidad,IdEntidad,Descripcion,IP");

        foreach (var auditLog in auditLogs)
        {
            csv.AppendLine(string.Join(
                ',',
                EscapeCsv(auditLog.CreatedAt.ToString("O")),
                EscapeCsv(auditLog.UserId),
                EscapeCsv(auditLog.Action.ToString()),
                EscapeCsv(auditLog.EntityName),
                EscapeCsv(auditLog.EntityId),
                EscapeCsv(auditLog.Description),
                EscapeCsv(auditLog.IpAddress)));
        }

        return csv.ToString();
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetByUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return [];
        }

        var normalizedUserId = userId.Trim();

        return await GetAuditLogsQuery(companyId)
            .Where(auditLog => auditLog.UserId == normalizedUserId)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetByEntityAsync(
        string entityName,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        if (string.IsNullOrWhiteSpace(entityName))
        {
            return [];
        }

        var normalizedEntityName = entityName.Trim().ToLower();

        return await GetAuditLogsQuery(companyId)
            .Where(auditLog => auditLog.EntityName.ToLower() == normalizedEntityName)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetByActionAsync(
        AuditAction action,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return await GetAuditLogsQuery(companyId)
            .Where(auditLog => auditLog.Action == action)
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .Select(auditLog => MapToResponse(auditLog))
            .ToListAsync(cancellationToken);
    }

    private IQueryable<AuditLog> GetAuditLogsQuery(Guid companyId)
    {
        return context.AuditLogs
            .AsNoTracking()
            .Where(auditLog => auditLog.CompanyId == companyId);
    }

    private static IQueryable<AuditLog> ApplyFilters(IQueryable<AuditLog> query, AuditLogFilterRequest request)
    {
        var search = request.NormalizeSearch();

        if (!string.IsNullOrWhiteSpace(request.Action))
        {
            if (Enum.TryParse<AuditAction>(request.Action.Trim(), ignoreCase: true, out var action)
                && Enum.IsDefined(action))
            {
                query = query.Where(auditLog => auditLog.Action == action);
            }
            else
            {
                query = query.Where(_ => false);
            }
        }

        if (!string.IsNullOrWhiteSpace(request.UserId))
        {
            var userId = request.UserId.Trim().ToLower();
            query = query.Where(auditLog => auditLog.UserId != null && auditLog.UserId.ToLower().Contains(userId));
        }

        if (!string.IsNullOrWhiteSpace(request.EntityName))
        {
            var entityName = request.EntityName.Trim().ToLower();
            query = query.Where(auditLog => auditLog.EntityName.ToLower().Contains(entityName));
        }

        if (!string.IsNullOrWhiteSpace(request.EntityId))
        {
            var entityId = request.EntityId.Trim().ToLower();
            query = query.Where(auditLog => auditLog.EntityId != null && auditLog.EntityId.ToLower().Contains(entityId));
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(auditLog => auditLog.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            var toDate = request.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(auditLog => auditLog.CreatedAt <= toDate);
        }

        if (search is not null)
        {
            query = query.Where(
                auditLog =>
                    (auditLog.UserId != null && auditLog.UserId.ToLower().Contains(search))
                    || auditLog.EntityName.ToLower().Contains(search)
                    || (auditLog.EntityId != null && auditLog.EntityId.ToLower().Contains(search))
                    || auditLog.Description.ToLower().Contains(search));
        }

        return query;
    }

    private static AuditLogResponse MapToResponse(AuditLog auditLog)
    {
        return new AuditLogResponse
        {
            Id = auditLog.Id,
            UserId = auditLog.UserId,
            IpAddress = null,
            Action = auditLog.Action,
            EntityName = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            Description = SanitizeDescription(auditLog.Description),
            CreatedAt = auditLog.CreatedAt
        };
    }

    private static string SanitizeDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            return description;
        }

        return SensitiveFieldRegex.Replace(description, match => $"{match.Groups["key"].Value}\"[REDACTED]\"");
    }

    private static string EscapeCsv(string? value)
    {
        var safeValue = value ?? string.Empty;

        return $"\"{safeValue.Replace("\"", "\"\"")}\"";
    }
}
