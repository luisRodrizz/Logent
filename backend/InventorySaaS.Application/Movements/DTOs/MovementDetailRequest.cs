namespace InventorySaaS.Application.Movements.DTOs;

public class MovementDetailRequest
{
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }
}
