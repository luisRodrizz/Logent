using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies");

        builder.HasKey(company => company.Id);

        builder.Property(company => company.Name)
            .IsRequired()
            .HasMaxLength(160);

        builder.Property(company => company.Ruc)
            .HasMaxLength(20);

        builder.Property(company => company.Slug)
            .IsRequired()
            .HasMaxLength(80);

        builder.Property(company => company.Email)
            .HasMaxLength(160);

        builder.Property(company => company.Phone)
            .HasMaxLength(30);

        builder.Property(company => company.Address)
            .HasMaxLength(250);

        builder.Property(company => company.Plan)
            .IsRequired();

        builder.Property(company => company.CreatedAt)
            .IsRequired();

        builder.Property(company => company.UpdatedAt);

        builder.Property(company => company.IsActive)
            .IsRequired();

        builder.HasIndex(company => company.Slug)
            .IsUnique();

        builder.HasIndex(company => company.Ruc)
            .IsUnique()
            .HasFilter("[Ruc] IS NOT NULL");
    }
}
