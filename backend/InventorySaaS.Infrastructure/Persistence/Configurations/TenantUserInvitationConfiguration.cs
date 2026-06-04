using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class TenantUserInvitationConfiguration : IEntityTypeConfiguration<TenantUserInvitation>
{
    public void Configure(EntityTypeBuilder<TenantUserInvitation> builder)
    {
        builder.ToTable("TenantUserInvitations");

        builder.HasKey(invitation => invitation.Id);

        builder.Property(invitation => invitation.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(invitation => invitation.FirstName)
            .IsRequired()
            .HasMaxLength(80);

        builder.Property(invitation => invitation.LastName)
            .IsRequired()
            .HasMaxLength(80);

        builder.Property(invitation => invitation.Role)
            .IsRequired()
            .HasMaxLength(40);

        builder.Property(invitation => invitation.TokenHash)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(invitation => invitation.Status)
            .IsRequired();

        builder.Property(invitation => invitation.ExpiresAt)
            .IsRequired();

        builder.Property(invitation => invitation.CreatedAt)
            .IsRequired();

        builder.Property(invitation => invitation.CreatedByUserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(invitation => invitation.CancelledByUserId)
            .HasMaxLength(450);

        builder.HasIndex(invitation => invitation.TokenHash)
            .IsUnique();

        builder.HasIndex(invitation => new { invitation.CompanyId, invitation.Email, invitation.Status });

        builder.HasOne(invitation => invitation.Company)
            .WithMany(company => company.TenantUserInvitations)
            .HasForeignKey(invitation => invitation.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
