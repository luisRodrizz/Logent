using InventorySaaS.Domain.Common;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Domain.Entities;

public class Movement : AuditableEntity
{
    public MovementType Type { get; set; }

    public Guid? WarehouseOriginId { get; set; }

    public Warehouse? WarehouseOrigin { get; set; }

    public Guid? WarehouseDestinationId { get; set; }

    public Warehouse? WarehouseDestination { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public string? Observation { get; set; }

    public string? CreatedByUserId { get; set; }

    public ICollection<MovementDetail> Details { get; set; } = new List<MovementDetail>();
}
