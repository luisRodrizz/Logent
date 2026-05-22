namespace InventorySaaS.Application.StockItems.DTOs;

public class StockItemResponse
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public string ProductCode { get; set; } = string.Empty;

    public string ProductName { get; set; } = string.Empty;

    public Guid WarehouseId { get; set; }

    public string WarehouseName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public DateTime UpdatedAt { get; set; }
}
