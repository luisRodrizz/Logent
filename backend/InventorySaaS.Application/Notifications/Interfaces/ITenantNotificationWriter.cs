using InventorySaaS.Application.Notifications.DTOs;

namespace InventorySaaS.Application.Notifications.Interfaces;

public interface ITenantNotificationWriter
{
    Task WriteAsync(
        CreateTenantNotificationRequest request,
        CancellationToken cancellationToken = default);
}
