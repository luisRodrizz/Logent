using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Company> Companies => Set<Company>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<Warehouse> Warehouses => Set<Warehouse>();

    public DbSet<StockItem> StockItems => Set<StockItem>();

    public DbSet<Movement> Movements => Set<Movement>();

    public DbSet<MovementDetail> MovementDetails => Set<MovementDetail>();

    public DbSet<KardexEntry> KardexEntries => Set<KardexEntry>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public DbSet<PlanUpgradeRequest> PlanUpgradeRequests => Set<PlanUpgradeRequest>();

    public DbSet<PlatformNotification> PlatformNotifications => Set<PlatformNotification>();

    public DbSet<TenantUserInvitation> TenantUserInvitations => Set<TenantUserInvitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<ApplicationUser>(builder =>
        {
            builder.HasOne(user => user.Company)
                .WithMany()
                .HasForeignKey(user => user.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(user => user.CompanyId);
        });
    }
}
