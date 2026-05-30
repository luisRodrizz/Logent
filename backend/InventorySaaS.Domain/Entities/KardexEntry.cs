using InventorySaaS.Domain.Common;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Domain.Entities;

public class KardexEntry : BaseEntity
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public Guid ProductId { get; set; }

    public Product? Product { get; set; }

    public Guid WarehouseId { get; set; }

    public Warehouse? Warehouse { get; set; }

    public Guid MovementId { get; set; }

    public Movement? Movement { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public MovementType MovementType { get; set; }

    public int QuantityIn { get; set; }

    public int QuantityOut { get; set; }

    public int StockBefore { get; set; }

    public int StockAfter { get; set; }

    public decimal UnitCost { get; set; }

    public string? CreatedByUserId { get; set; }

    public string? Observation { get; set; }
}
