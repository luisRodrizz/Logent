using InventorySaaS.Domain.Common;

namespace InventorySaaS.Domain.Entities;

public class StockItem : BaseEntity
{
    public Guid ProductId { get; set; }

    public Product? Product { get; set; }

    public Guid WarehouseId { get; set; }

    public Warehouse? Warehouse { get; set; }

    public int Quantity { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
