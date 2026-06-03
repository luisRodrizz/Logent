using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.TenantCompanySettings.DTOs;

public class TenantCompanySettingsResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? CommercialName { get; set; }

    public string Slug { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public string? ContactEmail { get; set; }

    public string? Website { get; set; }

    public string? LogoUrl { get; set; }

    public PlanType Plan { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
