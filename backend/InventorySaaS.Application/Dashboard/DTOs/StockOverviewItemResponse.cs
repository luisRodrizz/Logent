namespace InventorySaaS.Application.Dashboard.DTOs;

public class StockOverviewItemResponse
{
    public Guid ProductId { get; set; }

    public string ProductCode { get; set; } = string.Empty;

    public string ProductName { get; set; } = string.Empty;

    public int TotalQuantity { get; set; }

    public int MinimumStock { get; set; }

    public bool IsLowStock { get; set; }

    public decimal EstimatedValue { get; set; }
}
