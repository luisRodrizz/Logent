using InventorySaaS.Domain.Common;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Domain.Entities;

public class PlatformNotification : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public PlatformNotificationType Type { get; set; }

    public PlatformNotificationSeverity Severity { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }

    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string? RelatedEntityName { get; set; }

    public string? RelatedEntityId { get; set; }

    public string? ActionUrl { get; set; }
}
