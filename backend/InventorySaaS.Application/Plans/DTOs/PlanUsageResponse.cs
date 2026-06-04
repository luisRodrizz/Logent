using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Plans.DTOs;

public class PlanUsageResponse
{
    public PlanType Plan { get; set; }

    public PlanUsageMetrics Usage { get; set; } = new();

    public PlanUsageMetrics Limits { get; set; } = new();
}

public class PlanUsageMetrics
{
    public int Users { get; set; }

    public int Products { get; set; }

    public int Warehouses { get; set; }

    public int Suppliers { get; set; }

    public int Categories { get; set; }

    public int MonthlyMovements { get; set; }
}
