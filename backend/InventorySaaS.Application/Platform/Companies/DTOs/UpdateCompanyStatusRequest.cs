namespace InventorySaaS.Application.Platform.Companies.DTOs;

public class UpdateCompanyStatusRequest
{
    public bool IsActive { get; set; }

    public string? Reason { get; set; }
}
