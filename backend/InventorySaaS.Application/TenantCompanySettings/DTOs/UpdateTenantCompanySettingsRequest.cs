namespace InventorySaaS.Application.TenantCompanySettings.DTOs;

public class UpdateTenantCompanySettingsRequest
{
    public string? CommercialName { get; set; }

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public string? ContactEmail { get; set; }

    public string? Website { get; set; }

    public string? LogoUrl { get; set; }
}
