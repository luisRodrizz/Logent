using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Dashboard.DTOs;

public class RecentMovementResponse
{
    public Guid Id { get; set; }

    public MovementType Type { get; set; }

    public DateTime Date { get; set; }

    public string? WarehouseOriginName { get; set; }

    public string? WarehouseDestinationName { get; set; }

    public string? Observation { get; set; }

    public string CreatedByUserId { get; set; } = string.Empty;

    public int TotalItems { get; set; }

    public int TotalQuantity { get; set; }
}
