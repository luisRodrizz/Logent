namespace InventorySaaS.Application.Reports.DTOs;

public class KardexSummaryResponse
{
    public int TotalEntries { get; set; }

    public int TotalEntryUnits { get; set; }

    public int TotalExitUnits { get; set; }

    public decimal TotalInventoryValue { get; set; }

    public DateTime? LastMovementDate { get; set; }
}
