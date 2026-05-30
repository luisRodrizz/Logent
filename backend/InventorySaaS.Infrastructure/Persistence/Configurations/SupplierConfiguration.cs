using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("Suppliers");

        builder.HasKey(supplier => supplier.Id);

        builder.Property(supplier => supplier.BusinessName)
            .IsRequired()
            .HasMaxLength(160);

        builder.Property(supplier => supplier.Ruc)
            .HasMaxLength(20);

        builder.Property(supplier => supplier.Phone)
            .HasMaxLength(30);

        builder.Property(supplier => supplier.Email)
            .HasMaxLength(160);

        builder.Property(supplier => supplier.Address)
            .HasMaxLength(250);

        builder.Property(supplier => supplier.CreatedAt)
            .IsRequired();

        builder.Property(supplier => supplier.UpdatedAt);

        builder.Property(supplier => supplier.IsActive)
            .IsRequired();

        builder.HasIndex(supplier => new { supplier.CompanyId, supplier.Ruc })
            .IsUnique()
            .HasFilter("[Ruc] IS NOT NULL");

        builder.HasOne(supplier => supplier.Company)
            .WithMany(company => company.Suppliers)
            .HasForeignKey(supplier => supplier.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(supplier => supplier.Products)
            .WithOne(product => product.Supplier)
            .HasForeignKey(product => product.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
