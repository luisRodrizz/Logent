using InventorySaaS.Domain.Common;

namespace InventorySaaS.Domain.Entities;

public class Warehouse : AuditableEntity
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }

    public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
}
