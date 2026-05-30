using InventorySaaS.Domain.Common;

namespace InventorySaaS.Domain.Entities;

public class Supplier : AuditableEntity
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
