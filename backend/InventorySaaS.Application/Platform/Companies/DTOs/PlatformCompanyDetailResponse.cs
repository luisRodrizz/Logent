using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Companies.DTOs;

public class PlatformCompanyDetailResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public PlanType Plan { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int UsersCount { get; set; }

    public int ActiveUsersCount { get; set; }

    public int ProductsCount { get; set; }

    public int WarehousesCount { get; set; }

    public int MovementsCount { get; set; }

    public int StockItemsCount { get; set; }
}
