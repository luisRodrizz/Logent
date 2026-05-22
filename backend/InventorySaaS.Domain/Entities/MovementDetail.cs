using InventorySaaS.Domain.Common;

namespace InventorySaaS.Domain.Entities;

public class MovementDetail : BaseEntity
{
    public Guid MovementId { get; set; }

    public Movement? Movement { get; set; }

    public Guid ProductId { get; set; }

    public Product? Product { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }
}
