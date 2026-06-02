namespace InventorySaaS.Application.Platform.Activity.DTOs;

public class PlatformActivityListResponse
{
    public IReadOnlyList<PlatformActivityItemResponse> Items { get; set; } = [];

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalItems { get; set; }

    public int TotalPages { get; set; }
}
