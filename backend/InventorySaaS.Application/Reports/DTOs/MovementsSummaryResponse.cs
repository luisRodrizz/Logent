namespace InventorySaaS.Application.Reports.DTOs;

public class MovementsSummaryResponse
{
    public int TotalMovements { get; set; }

    public int TotalEntries { get; set; }

    public int TotalExits { get; set; }

    public int TotalTransfers { get; set; }

    public int TotalMovementDetails { get; set; }

    public int TotalUnitsMoved { get; set; }
}
