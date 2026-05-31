using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Companies.DTOs;

public class PlatformCompanyListItemResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public PlanType Plan { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int UsersCount { get; set; }

    public int ProductsCount { get; set; }

    public int WarehousesCount { get; set; }
}
