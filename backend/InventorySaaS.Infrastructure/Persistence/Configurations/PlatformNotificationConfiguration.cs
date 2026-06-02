using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class PlatformNotificationConfiguration : IEntityTypeConfiguration<PlatformNotification>
{
    public void Configure(EntityTypeBuilder<PlatformNotification> builder)
    {
        builder.ToTable("PlatformNotifications");

        builder.HasKey(notification => notification.Id);

        builder.Property(notification => notification.Title)
            .IsRequired()
            .HasMaxLength(160);

        builder.Property(notification => notification.Message)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(notification => notification.Type)
            .IsRequired();

        builder.Property(notification => notification.Severity)
            .IsRequired();

        builder.Property(notification => notification.IsRead)
            .IsRequired();

        builder.Property(notification => notification.CreatedAt)
            .IsRequired();

        builder.Property(notification => notification.RelatedEntityName)
            .HasMaxLength(120);

        builder.Property(notification => notification.RelatedEntityId)
            .HasMaxLength(120);

        builder.Property(notification => notification.ActionUrl)
            .HasMaxLength(300);

        builder.HasIndex(notification => notification.CompanyId);

        builder.HasIndex(notification => new { notification.IsRead, notification.CreatedAt });

        builder.HasOne(notification => notification.Company)
            .WithMany(company => company.PlatformNotifications)
            .HasForeignKey(notification => notification.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
