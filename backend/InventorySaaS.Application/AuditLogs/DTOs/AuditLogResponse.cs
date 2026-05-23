using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.AuditLogs.DTOs;

public class AuditLogResponse
{
    public Guid Id { get; set; }

    public string? UserId { get; set; }

    public AuditAction Action { get; set; }

    public string EntityName { get; set; } = string.Empty;

    public string? EntityId { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }
}
