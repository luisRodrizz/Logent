using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Activity.DTOs;

public class PlatformActivityItemResponse
{
    public Guid Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid? CompanyId { get; set; }

    public string? CompanyName { get; set; }

    public string? UserId { get; set; }

    public string? UserEmail { get; set; }

    public AuditAction Action { get; set; }

    public string EntityName { get; set; } = string.Empty;

    public string? EntityId { get; set; }

    public string Description { get; set; } = string.Empty;
}
