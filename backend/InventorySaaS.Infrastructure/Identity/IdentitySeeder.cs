using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace InventorySaaS.Infrastructure.Identity;

public static class IdentitySeeder
{
    public const string SuperAdminRole = "SuperAdmin";
    public const string AdminRole = "Admin";
    public const string WarehouseRole = "Almacenero";
    public const string ReadOnlyRole = "Consulta";

    private const string AdminEmail = "admin@inventorysaas.com";
    private const string AdminPassword = "Admin123";

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

        foreach (var role in new[] { SuperAdminRole, AdminRole, WarehouseRole, ReadOnlyRole })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        var company = await context.Companies
            .FirstOrDefaultAsync(company => company.Id == DemoTenantDefaults.CompanyId);

        if (company is null)
        {
            company = new Company
            {
                Id = DemoTenantDefaults.CompanyId,
                CreatedAt = DateTime.UtcNow
            };

            context.Companies.Add(company);
        }

        company.Name = DemoTenantDefaults.CompanyName;
        company.Slug = DemoTenantDefaults.CompanySlug;
        company.Email = DemoTenantDefaults.CompanyEmail;
        company.Plan = DemoTenantDefaults.CompanyPlan;
        company.IsActive = true;
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var adminUser = await userManager.FindByEmailAsync(AdminEmail);

        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = AdminEmail,
                Email = AdminEmail,
                EmailConfirmed = true,
                CompanyId = company.Id,
                FirstName = "System",
                LastName = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(adminUser, AdminPassword);

            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(error => error.Description));
                throw new InvalidOperationException($"Failed to create admin user: {errors}");
            }
        }
        else if (adminUser.CompanyId != company.Id)
        {
            adminUser.CompanyId = company.Id;
            var updateResult = await userManager.UpdateAsync(adminUser);

            if (!updateResult.Succeeded)
            {
                var errors = string.Join("; ", updateResult.Errors.Select(error => error.Description));
                throw new InvalidOperationException($"Failed to update admin user company: {errors}");
            }
        }

        if (!await userManager.IsInRoleAsync(adminUser, AdminRole))
        {
            await userManager.AddToRoleAsync(adminUser, AdminRole);
        }
    }
}
