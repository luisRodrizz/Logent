using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class MovementConfiguration : IEntityTypeConfiguration<Movement>
{
    public void Configure(EntityTypeBuilder<Movement> builder)
    {
        builder.ToTable("Movements");

        builder.HasKey(movement => movement.Id);

        builder.Property(movement => movement.Type)
            .IsRequired();

        builder.Property(movement => movement.Date)
            .IsRequired();

        builder.Property(movement => movement.Observation)
            .HasMaxLength(500);

        builder.Property(movement => movement.CreatedByUserId)
            .HasMaxLength(450);

        builder.Property(movement => movement.CreatedAt)
            .IsRequired();

        builder.Property(movement => movement.UpdatedAt);

        builder.Property(movement => movement.IsActive)
            .IsRequired();

        builder.HasIndex(movement => movement.CompanyId);

        builder.HasOne(movement => movement.Company)
            .WithMany(company => company.Movements)
            .HasForeignKey(movement => movement.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movement => movement.WarehouseOrigin)
            .WithMany()
            .HasForeignKey(movement => movement.WarehouseOriginId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(movement => movement.WarehouseDestination)
            .WithMany()
            .HasForeignKey(movement => movement.WarehouseDestinationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(movement => movement.Details)
            .WithOne(movementDetail => movementDetail.Movement)
            .HasForeignKey(movementDetail => movementDetail.MovementId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
