namespace InventorySaaS.Application.Platform.Notifications.DTOs;

public class PlatformNotificationListResponse
{
    public IReadOnlyList<PlatformNotificationItemResponse> Items { get; set; } = [];

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalItems { get; set; }

    public int TotalPages { get; set; }

    public int UnreadItems { get; set; }

    public int AttentionItems { get; set; }
}
