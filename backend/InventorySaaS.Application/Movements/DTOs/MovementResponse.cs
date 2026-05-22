using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Movements.DTOs;

public class MovementResponse
{
    public Guid Id { get; set; }

    public MovementType Type { get; set; }

    public DateTime Date { get; set; }

    public Guid? WarehouseOriginId { get; set; }

    public string? WarehouseOriginName { get; set; }

    public Guid? WarehouseDestinationId { get; set; }

    public string? WarehouseDestinationName { get; set; }

    public string? Observation { get; set; }

    public string CreatedByUserId { get; set; } = string.Empty;

    public IReadOnlyList<MovementDetailResponse> Details { get; set; } = new List<MovementDetailResponse>();
}
