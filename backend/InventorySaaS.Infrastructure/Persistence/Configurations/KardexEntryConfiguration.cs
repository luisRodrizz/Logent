using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class KardexEntryConfiguration : IEntityTypeConfiguration<KardexEntry>
{
    public void Configure(EntityTypeBuilder<KardexEntry> builder)
    {
        builder.ToTable("KardexEntries");

        builder.HasKey(kardexEntry => kardexEntry.Id);

        builder.Property(kardexEntry => kardexEntry.Date)
            .IsRequired();

        builder.Property(kardexEntry => kardexEntry.MovementType)
            .IsRequired();

        builder.Property(kardexEntry => kardexEntry.QuantityIn)
            .IsRequired();

        builder.Property(kardexEntry => kardexEntry.QuantityOut)
            .IsRequired();

        builder.Property(kardexEntry => kardexEntry.StockBefore)
            .IsRequired();

        builder.Property(kardexEntry => kardexEntry.StockAfter)
            .IsRequired();

        builder.Property(kardexEntry => kardexEntry.UnitCost)
            .HasColumnType("decimal(18,2)");

        builder.Property(kardexEntry => kardexEntry.CreatedByUserId)
            .HasMaxLength(450);

        builder.Property(kardexEntry => kardexEntry.Observation)
            .HasMaxLength(500);

        builder.HasIndex(kardexEntry => kardexEntry.CompanyId);

        builder.HasOne(kardexEntry => kardexEntry.Company)
            .WithMany(company => company.KardexEntries)
            .HasForeignKey(kardexEntry => kardexEntry.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(kardexEntry => kardexEntry.Product)
            .WithMany(product => product.KardexEntries)
            .HasForeignKey(kardexEntry => kardexEntry.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(kardexEntry => kardexEntry.Warehouse)
            .WithMany()
            .HasForeignKey(kardexEntry => kardexEntry.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(kardexEntry => kardexEntry.Movement)
            .WithMany()
            .HasForeignKey(kardexEntry => kardexEntry.MovementId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
