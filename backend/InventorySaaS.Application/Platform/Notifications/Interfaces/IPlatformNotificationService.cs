using InventorySaaS.Application.Platform.Notifications.DTOs;

namespace InventorySaaS.Application.Platform.Notifications.Interfaces;

public interface IPlatformNotificationService
{
    Task<PlatformNotificationListResponse> GetAllAsync(
        PlatformNotificationQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<PlatformNotificationUnreadCountResponse> GetUnreadCountAsync(
        CancellationToken cancellationToken = default);

    Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken = default);

    Task MarkAllAsReadAsync(CancellationToken cancellationToken = default);
}
