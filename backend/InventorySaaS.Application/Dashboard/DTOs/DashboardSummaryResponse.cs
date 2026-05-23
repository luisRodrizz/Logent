namespace InventorySaaS.Application.Dashboard.DTOs;

public class DashboardSummaryResponse
{
    public int TotalCategories { get; set; }

    public int TotalSuppliers { get; set; }

    public int TotalWarehouses { get; set; }

    public int TotalProducts { get; set; }

    public int TotalStockItems { get; set; }

    public int LowStockItems { get; set; }

    public int TotalMovements { get; set; }

    public int TotalKardexEntries { get; set; }

    public decimal TotalInventoryValue { get; set; }
}
