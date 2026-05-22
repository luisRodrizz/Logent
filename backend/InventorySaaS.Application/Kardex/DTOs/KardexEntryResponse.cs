using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Kardex.DTOs;

public class KardexEntryResponse
{
    public Guid Id { get; set; }

    public DateTime Date { get; set; }

    public Guid ProductId { get; set; }

    public string ProductCode { get; set; } = string.Empty;

    public string ProductName { get; set; } = string.Empty;

    public Guid WarehouseId { get; set; }

    public string WarehouseName { get; set; } = string.Empty;

    public Guid? MovementId { get; set; }

    public MovementType MovementType { get; set; }

    public int Quantity { get; set; }

    public int StockBefore { get; set; }

    public int StockAfter { get; set; }

    public decimal UnitCost { get; set; }

    public string CreatedByUserId { get; set; } = string.Empty;

    public string? Observation { get; set; }
}
