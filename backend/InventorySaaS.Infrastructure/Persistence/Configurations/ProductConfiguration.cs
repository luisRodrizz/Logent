using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(product => product.Id);

        builder.Property(product => product.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(product => product.Name)
            .IsRequired()
            .HasMaxLength(160);

        builder.Property(product => product.Description)
            .HasMaxLength(500);

        builder.Property(product => product.PurchasePrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(product => product.SalePrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(product => product.MinimumStock)
            .IsRequired();

        builder.Property(product => product.CreatedAt)
            .IsRequired();

        builder.Property(product => product.UpdatedAt);

        builder.Property(product => product.IsActive)
            .IsRequired();

        builder.HasIndex(product => new { product.CompanyId, product.Code })
            .IsUnique();

        builder.HasOne(product => product.Company)
            .WithMany(company => company.Products)
            .HasForeignKey(product => product.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(product => product.Category)
            .WithMany(category => category.Products)
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(product => product.Supplier)
            .WithMany(supplier => supplier.Products)
            .HasForeignKey(product => product.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(product => product.StockItems)
            .WithOne(stockItem => stockItem.Product)
            .HasForeignKey(stockItem => stockItem.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(product => product.MovementDetails)
            .WithOne(movementDetail => movementDetail.Product)
            .HasForeignKey(movementDetail => movementDetail.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(product => product.KardexEntries)
            .WithOne(kardexEntry => kardexEntry.Product)
            .HasForeignKey(kardexEntry => kardexEntry.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
