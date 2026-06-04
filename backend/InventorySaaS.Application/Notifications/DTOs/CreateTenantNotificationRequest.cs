using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Notifications.DTOs;

public class CreateTenantNotificationRequest
{
    public Guid CompanyId { get; set; }

    public string? UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public TenantNotificationType Type { get; set; }

    public TenantNotificationSeverity Severity { get; set; }

    public string? ActionUrl { get; set; }
}
