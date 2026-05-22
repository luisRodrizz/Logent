namespace InventorySaaS.Application.Products.DTOs;

public class ProductResponse
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public Guid? SupplierId { get; set; }

    public string? SupplierName { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SalePrice { get; set; }

    public int MinimumStock { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
