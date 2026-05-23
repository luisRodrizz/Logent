using InventorySaaS.Application.AuditLogs.DTOs;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.AuditLogs.Interfaces;

public interface IAuditLogService
{
    Task<IReadOnlyList<AuditLogResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<AuditLogResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLogResponse>> GetByUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLogResponse>> GetByEntityAsync(
        string entityName,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLogResponse>> GetByActionAsync(
        AuditAction action,
        CancellationToken cancellationToken = default);
}
