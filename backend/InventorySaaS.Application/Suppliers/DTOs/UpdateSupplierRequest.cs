namespace InventorySaaS.Application.Suppliers.DTOs;

public class UpdateSupplierRequest
{
    public string BusinessName { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }
}
