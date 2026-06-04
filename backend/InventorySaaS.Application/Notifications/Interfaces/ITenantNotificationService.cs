using InventorySaaS.Application.Notifications.DTOs;

namespace InventorySaaS.Application.Notifications.Interfaces;

public interface ITenantNotificationService
{
    Task<IReadOnlyList<TenantNotificationResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TenantNotificationUnreadCountResponse> GetUnreadCountAsync(CancellationToken cancellationToken = default);

    Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken = default);

    Task MarkAllAsReadAsync(CancellationToken cancellationToken = default);
}
