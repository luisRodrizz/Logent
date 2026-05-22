using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Movements.DTOs;

public class CreateMovementRequest
{
    public MovementType Type { get; set; }

    public Guid? WarehouseOriginId { get; set; }

    public Guid? WarehouseDestinationId { get; set; }

    public string? Observation { get; set; }

    public List<MovementDetailRequest> Details { get; set; } = new();
}
