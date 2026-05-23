namespace InventorySaaS.Application.Reports.DTOs;

public class StockSummaryResponse
{
    public Guid ProductId { get; set; }

    public string ProductCode { get; set; } = string.Empty;

    public string ProductName { get; set; } = string.Empty;

    public Guid WarehouseId { get; set; }

    public string WarehouseName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public int MinimumStock { get; set; }

    public bool IsLowStock { get; set; }

    public decimal EstimatedStockValue { get; set; }
}
