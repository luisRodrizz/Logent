using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Notifications.DTOs;

public class PlatformNotificationItemResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public PlatformNotificationType Type { get; set; }

    public PlatformNotificationSeverity Severity { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReadAt { get; set; }

    public Guid? CompanyId { get; set; }

    public string? CompanyName { get; set; }

    public string? RelatedEntityName { get; set; }

    public string? RelatedEntityId { get; set; }

    public string? ActionUrl { get; set; }
}
