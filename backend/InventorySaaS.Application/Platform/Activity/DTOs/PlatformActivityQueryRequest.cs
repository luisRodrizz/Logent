using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Activity.DTOs;

public class PlatformActivityQueryRequest
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

    public Guid? CompanyId { get; set; }

    public AuditAction? Action { get; set; }

    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }

    public string? EntityName { get; set; }
}
