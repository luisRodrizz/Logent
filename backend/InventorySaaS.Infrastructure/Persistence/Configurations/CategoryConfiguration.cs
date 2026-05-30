using InventorySaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventorySaaS.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(category => category.Id);

        builder.Property(category => category.Name)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(category => category.Description)
            .HasMaxLength(300);

        builder.Property(category => category.CreatedAt)
            .IsRequired();

        builder.Property(category => category.UpdatedAt);

        builder.Property(category => category.IsActive)
            .IsRequired();

        builder.HasIndex(category => new { category.CompanyId, category.Name })
            .IsUnique();

        builder.HasOne(category => category.Company)
            .WithMany(company => company.Categories)
            .HasForeignKey(category => category.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(category => category.Products)
            .WithOne(product => product.Category)
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
