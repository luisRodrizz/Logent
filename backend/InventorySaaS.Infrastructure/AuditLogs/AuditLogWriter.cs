using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;

namespace InventorySaaS.Infrastructure.AuditLogs;

public class AuditLogWriter(ApplicationDbContext context) : IAuditLogWriter
{
    public async Task WriteAsync(
        string? userId,
        AuditAction action,
        string entityName,
        string? entityId,
        string? description,
        CancellationToken cancellationToken = default,
        Guid? companyId = null)
    {
        context.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Description = description ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync(cancellationToken);
    }
}
