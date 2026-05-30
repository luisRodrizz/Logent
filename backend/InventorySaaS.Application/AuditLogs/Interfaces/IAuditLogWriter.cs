using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.AuditLogs.Interfaces;

public interface IAuditLogWriter
{
    Task WriteAsync(
        string? userId,
        AuditAction action,
        string entityName,
        string? entityId,
        string? description,
        CancellationToken cancellationToken = default,
        Guid? companyId = null);
}
