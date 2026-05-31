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
    private const string SuperAdminEmail = "superadmin@logent.local";
    private const string SuperAdminPassword = "SuperAdmin123";

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

        foreach (var role in new[] { SuperAdminRole, AdminRole, WarehouseRole, ReadOnlyRole })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                EnsureSucceeded(
                    await roleManager.CreateAsync(new IdentityRole(role)),
                    $"Failed to create role {role}.");
            }
        }

        await SeedSuperAdminAsync(userManager);

        var company = await context.Companies
            .FirstOrDefaultAsync(company => company.Id == DemoTenantDefaults.CompanyId);

        if (company is null)
        {
            company = new Company
            {
                Id = DemoTenantDefaults.CompanyId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            context.Companies.Add(company);
        }

        company.Name = DemoTenantDefaults.CompanyName;
        company.Slug = DemoTenantDefaults.CompanySlug;
        company.Email = DemoTenantDefaults.CompanyEmail;
        company.Plan = DemoTenantDefaults.CompanyPlan;
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
        else
        {
            var shouldUpdateAdmin = false;

            if (adminUser.CompanyId != company.Id)
            {
                adminUser.CompanyId = company.Id;
                shouldUpdateAdmin = true;
            }

            if (!adminUser.EmailConfirmed)
            {
                adminUser.EmailConfirmed = true;
                shouldUpdateAdmin = true;
            }

            if (shouldUpdateAdmin)
            {
                var updateResult = await userManager.UpdateAsync(adminUser);

                if (!updateResult.Succeeded)
                {
                    var errors = string.Join("; ", updateResult.Errors.Select(error => error.Description));
                    throw new InvalidOperationException($"Failed to update admin user: {errors}");
                }
            }
        }

        if (!await userManager.IsInRoleAsync(adminUser, AdminRole))
        {
            EnsureSucceeded(
                await userManager.AddToRoleAsync(adminUser, AdminRole),
                "Failed to assign admin role.");
        }
    }

    private static async Task SeedSuperAdminAsync(UserManager<ApplicationUser> userManager)
    {
        var superAdmin = await userManager.FindByEmailAsync(SuperAdminEmail);

        if (superAdmin is null)
        {
            superAdmin = new ApplicationUser
            {
                UserName = SuperAdminEmail,
                Email = SuperAdminEmail,
                EmailConfirmed = true,
                CompanyId = null,
                FirstName = "Super",
                LastName = "Administrador LOGENT",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            EnsureSucceeded(
                await userManager.CreateAsync(superAdmin, SuperAdminPassword),
                "Failed to create super admin user.");
        }
        else
        {
            superAdmin.CompanyId = null;
            superAdmin.EmailConfirmed = true;
            superAdmin.IsActive = true;
            superAdmin.FirstName = "Super";
            superAdmin.LastName = "Administrador LOGENT";

            EnsureSucceeded(
                await userManager.UpdateAsync(superAdmin),
                "Failed to update super admin user.");
        }

        var currentRoles = await userManager.GetRolesAsync(superAdmin);
        var rolesToRemove = currentRoles
            .Where(role => !string.Equals(role, SuperAdminRole, StringComparison.Ordinal))
            .ToArray();

        if (rolesToRemove.Length > 0)
        {
            EnsureSucceeded(
                await userManager.RemoveFromRolesAsync(superAdmin, rolesToRemove),
                "Failed to remove tenant roles from super admin user.");
        }

        if (!await userManager.IsInRoleAsync(superAdmin, SuperAdminRole))
        {
            EnsureSucceeded(
                await userManager.AddToRoleAsync(superAdmin, SuperAdminRole),
                "Failed to assign super admin role.");
        }
    }

    private static void EnsureSucceeded(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error => error.Description));

        throw new InvalidOperationException($"{message} {errors}");
    }
}
