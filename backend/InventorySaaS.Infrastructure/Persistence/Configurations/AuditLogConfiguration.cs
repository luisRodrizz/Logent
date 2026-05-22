using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(auditLog => auditLog.Id);

        builder.Property(auditLog => auditLog.UserId)
            .HasMaxLength(450);

        builder.Property(auditLog => auditLog.Action)
            .IsRequired();

        builder.Property(auditLog => auditLog.EntityName)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(auditLog => auditLog.EntityId)
            .HasMaxLength(80);

        builder.Property(auditLog => auditLog.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(auditLog => auditLog.CreatedAt)
            .IsRequired();
    }
}
