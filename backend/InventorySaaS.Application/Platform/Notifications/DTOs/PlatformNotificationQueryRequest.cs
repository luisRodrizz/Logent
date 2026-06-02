using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Notifications.DTOs;

public class PlatformNotificationQueryRequest
{
    private const int MaxPageSize = 100;

    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 20,
            > MaxPageSize => MaxPageSize,
            _ => value
        };
    }

    public string? Search { get; set; }

    public PlatformNotificationType? Type { get; set; }

    public PlatformNotificationSeverity? Severity { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }
}
