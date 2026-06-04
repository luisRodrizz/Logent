using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Notifications.DTOs;

public class TenantNotificationResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public TenantNotificationType Type { get; set; }

    public TenantNotificationSeverity Severity { get; set; }

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? ActionUrl { get; set; }
}
