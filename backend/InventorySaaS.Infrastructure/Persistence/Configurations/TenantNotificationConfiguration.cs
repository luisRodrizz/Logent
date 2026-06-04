using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class TenantNotificationConfiguration : IEntityTypeConfiguration<TenantNotification>
{
    public void Configure(EntityTypeBuilder<TenantNotification> builder)
    {
        builder.ToTable("TenantNotifications");

        builder.HasKey(notification => notification.Id);

        builder.Property(notification => notification.UserId)
            .HasMaxLength(450);

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

        builder.Property(notification => notification.ActionUrl)
            .HasMaxLength(300);

        builder.HasIndex(notification => notification.CompanyId);

        builder.HasIndex(notification => new
        {
            notification.CompanyId,
            notification.UserId,
            notification.IsRead,
            notification.CreatedAt
        });

        builder.HasOne(notification => notification.Company)
            .WithMany(company => company.TenantNotifications)
            .HasForeignKey(notification => notification.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
