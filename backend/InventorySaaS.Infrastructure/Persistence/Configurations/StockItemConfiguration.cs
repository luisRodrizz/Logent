using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class StockItemConfiguration : IEntityTypeConfiguration<StockItem>
{
    public void Configure(EntityTypeBuilder<StockItem> builder)
    {
        builder.ToTable("StockItems");

        builder.HasKey(stockItem => stockItem.Id);

        builder.Property(stockItem => stockItem.Quantity)
            .IsRequired();

        builder.Property(stockItem => stockItem.UpdatedAt)
            .IsRequired();

        builder.HasIndex(stockItem => new { stockItem.ProductId, stockItem.WarehouseId })
            .IsUnique();

        builder.HasOne(stockItem => stockItem.Product)
            .WithMany(product => product.StockItems)
            .HasForeignKey(stockItem => stockItem.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(stockItem => stockItem.Warehouse)
            .WithMany(warehouse => warehouse.StockItems)
            .HasForeignKey(stockItem => stockItem.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
