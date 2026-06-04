using InventorySaaS.Domain.Common;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Domain.Entities;

public class Company : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string Slug { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? CommercialName { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? ContactEmail { get; set; }

    public string? Website { get; set; }

    public string? LogoUrl { get; set; }

    public PlanType Plan { get; set; } = PlanType.Free;

    public string? StripeCustomerId { get; set; }

    public string? StripeSubscriptionId { get; set; }

    public string? StripeSubscriptionStatus { get; set; }

    public DateTime? StripeCurrentPeriodEnd { get; set; }

    public ICollection<Category> Categories { get; set; } = new List<Category>();

    public ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();

    public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();

    public ICollection<Product> Products { get; set; } = new List<Product>();

    public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();

    public ICollection<Movement> Movements { get; set; } = new List<Movement>();

    public ICollection<KardexEntry> KardexEntries { get; set; } = new List<KardexEntry>();

    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public ICollection<PlanUpgradeRequest> PlanUpgradeRequests { get; set; } = new List<PlanUpgradeRequest>();

    public ICollection<PlatformNotification> PlatformNotifications { get; set; } = new List<PlatformNotification>();

    public ICollection<TenantUserInvitation> TenantUserInvitations { get; set; } = new List<TenantUserInvitation>();
}
