namespace InventorySaaS.Application.Warehouses.DTOs;

public class CreateWarehouseRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }
}
