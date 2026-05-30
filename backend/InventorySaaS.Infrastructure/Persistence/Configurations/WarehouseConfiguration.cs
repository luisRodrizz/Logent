using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.HasKey(warehouse => warehouse.Id);

        builder.Property(warehouse => warehouse.Name)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(warehouse => warehouse.Location)
            .HasMaxLength(200);

        builder.Property(warehouse => warehouse.Description)
            .HasMaxLength(300);

        builder.Property(warehouse => warehouse.CreatedAt)
            .IsRequired();

        builder.Property(warehouse => warehouse.UpdatedAt);

        builder.Property(warehouse => warehouse.IsActive)
            .IsRequired();

        builder.HasIndex(warehouse => new { warehouse.CompanyId, warehouse.Name })
            .IsUnique();

        builder.HasOne(warehouse => warehouse.Company)
            .WithMany(company => company.Warehouses)
            .HasForeignKey(warehouse => warehouse.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(warehouse => warehouse.StockItems)
            .WithOne(stockItem => stockItem.Warehouse)
            .HasForeignKey(stockItem => stockItem.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
