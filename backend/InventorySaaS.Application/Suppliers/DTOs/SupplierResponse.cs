namespace InventorySaaS.Application.Suppliers.DTOs;

public class SupplierResponse
{
    public Guid Id { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
