using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class MovementDetailConfiguration : IEntityTypeConfiguration<MovementDetail>
{
    public void Configure(EntityTypeBuilder<MovementDetail> builder)
    {
        builder.ToTable("MovementDetails");

        builder.HasKey(movementDetail => movementDetail.Id);

        builder.Property(movementDetail => movementDetail.Quantity)
            .IsRequired();

        builder.Property(movementDetail => movementDetail.UnitCost)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(movementDetail => movementDetail.Movement)
            .WithMany(movement => movement.Details)
            .HasForeignKey(movementDetail => movementDetail.MovementId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(movementDetail => movementDetail.Product)
            .WithMany(product => product.MovementDetails)
            .HasForeignKey(movementDetail => movementDetail.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
