using InventorySaaS.Application.Platform.Notifications.DTOs;

namespace InventorySaaS.Application.Platform.Notifications.Interfaces;

public interface IPlatformNotificationWriter
{
    Task WriteAsync(
        CreatePlatformNotificationRequest request,
        CancellationToken cancellationToken = default);
}
