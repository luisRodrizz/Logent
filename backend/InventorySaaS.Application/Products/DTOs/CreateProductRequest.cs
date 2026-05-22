namespace InventorySaaS.Application.Products.DTOs;

public class CreateProductRequest
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid CategoryId { get; set; }

    public Guid? SupplierId { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SalePrice { get; set; }

    public int MinimumStock { get; set; }
}
