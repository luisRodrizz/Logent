using InventorySaaS.Domain.Common;

namespace InventorySaaS.Domain.Entities;

public class Category : AuditableEntity
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
