using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class PlanUpgradeRequestConfiguration : IEntityTypeConfiguration<PlanUpgradeRequest>
{
    public void Configure(EntityTypeBuilder<PlanUpgradeRequest> builder)
    {
        builder.ToTable("PlanUpgradeRequests");

        builder.HasKey(request => request.Id);

        builder.Property(request => request.RequestedPlan)
            .IsRequired();

        builder.Property(request => request.CurrentPlan)
            .IsRequired();

        builder.Property(request => request.Status)
            .IsRequired();

        builder.Property(request => request.Message)
            .HasMaxLength(500);

        builder.Property(request => request.ResolutionNote)
            .HasMaxLength(500);

        builder.Property(request => request.RequestedByUserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(request => request.ResolvedByUserId)
            .HasMaxLength(450);

        builder.Property(request => request.CreatedAt)
            .IsRequired();

        builder.HasIndex(request => request.CompanyId);

        builder.HasIndex(request => new { request.CompanyId, request.Status });

        builder.HasOne(request => request.Company)
            .WithMany(company => company.PlanUpgradeRequests)
            .HasForeignKey(request => request.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
