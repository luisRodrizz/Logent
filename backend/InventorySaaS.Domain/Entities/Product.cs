using InventorySaaS.Domain.Common;

namespace InventorySaaS.Domain.Entities;

public class Product : AuditableEntity
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid CategoryId { get; set; }

    public Category? Category { get; set; }

    public Guid? SupplierId { get; set; }

    public Supplier? Supplier { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SalePrice { get; set; }

    public int MinimumStock { get; set; }

    public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();

    public ICollection<MovementDetail> MovementDetails { get; set; } = new List<MovementDetail>();

    public ICollection<KardexEntry> KardexEntries { get; set; } = new List<KardexEntry>();
}
