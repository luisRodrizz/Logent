using System.Globalization;
using System.Text;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Auth.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Authentication;

public class CompanyRegistrationService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IEmailConfirmationService emailConfirmationService) : ICompanyRegistrationService
{
    private const int MaximumSlugLength = 80;

    public async Task<MessageResponse> RegisterAsync(
        RegisterCompanyRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyName = request.CompanyName.Trim();
        var ruc = NormalizeOptionalText(request.Ruc);
        var companyEmail = request.Email.Trim();
        var adminEmail = request.AdminEmail.Trim();

        await EnsureRucIsAvailableAsync(ruc, cancellationToken);
        await EnsureAdminEmailIsAvailableAsync(adminEmail);

        if (!await roleManager.RoleExistsAsync(IdentitySeeder.AdminRole))
        {
            throw new ApiException(
                500,
                "Admin role is not configured.",
                "The required Admin role is not available.");
        }

        var slug = await GenerateUniqueSlugAsync(companyName, cancellationToken);
        var now = DateTime.UtcNow;

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var company = new Company
            {
                Id = Guid.NewGuid(),
                Name = companyName,
                Ruc = ruc,
                Slug = slug,
                Email = companyEmail,
                Phone = NormalizeOptionalText(request.Phone),
                Address = NormalizeOptionalText(request.Address),
                Plan = PlanType.Free,
                IsActive = true,
                CreatedAt = now
            };

            context.Companies.Add(company);
            await context.SaveChangesAsync(cancellationToken);

            var name = SplitFullName(request.AdminFullName);
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = false,
                CompanyId = company.Id,
                FirstName = name.FirstName,
                LastName = name.LastName,
                IsActive = true,
                CreatedAt = now
            };

            var createResult = await userManager.CreateAsync(adminUser, request.AdminPassword);
            EnsureIdentitySucceeded(createResult, "Could not create company Admin user.");

            var roleResult = await userManager.AddToRoleAsync(adminUser, IdentitySeeder.AdminRole);
            EnsureIdentitySucceeded(roleResult, "Could not assign company Admin role.");

            await emailConfirmationService.SendConfirmationEmailAsync(
                adminUser.Id,
                companyName,
                cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new MessageResponse
        {
            Message = "Empresa registrada correctamente. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión."
        };
    }

    private async Task EnsureRucIsAvailableAsync(string? ruc, CancellationToken cancellationToken)
    {
        if (ruc is null)
        {
            return;
        }

        var exists = await context.Companies
            .AsNoTracking()
            .AnyAsync(company => company.Ruc == ruc, cancellationToken);

        if (exists)
        {
            throw new ApiException(
                400,
                "A company with this RUC already exists.",
                "A company with this RUC already exists.");
        }
    }

    private async Task EnsureAdminEmailIsAvailableAsync(string email)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            throw new ApiException(
                400,
                "A user with this email already exists.",
                "A user with this email already exists.");
        }
    }

    private async Task<string> GenerateUniqueSlugAsync(string companyName, CancellationToken cancellationToken)
    {
        var baseSlug = CreateSlug(companyName);
        var slug = baseSlug;
        var suffix = 2;

        while (await context.Companies.AsNoTracking().AnyAsync(company => company.Slug == slug, cancellationToken))
        {
            slug = BuildSlugWithSuffix(baseSlug, suffix);
            suffix++;
        }

        return slug;
    }

    private static string CreateSlug(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        var addSeparator = false;

        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(character))
            {
                if (addSeparator && builder.Length > 0 && builder[^1] != '-')
                {
                    builder.Append('-');
                }

                builder.Append(char.ToLowerInvariant(character));
                addSeparator = false;
                continue;
            }

            addSeparator = builder.Length > 0;
        }

        var slug = builder.ToString().Trim('-');

        if (string.IsNullOrWhiteSpace(slug))
        {
            slug = "empresa";
        }

        return slug.Length <= MaximumSlugLength
            ? slug
            : slug[..MaximumSlugLength].TrimEnd('-');
    }

    private static string BuildSlugWithSuffix(string baseSlug, int suffix)
    {
        var suffixText = $"-{suffix}";
        var maximumBaseLength = MaximumSlugLength - suffixText.Length;
        var truncatedBaseSlug = baseSlug.Length <= maximumBaseLength
            ? baseSlug
            : baseSlug[..maximumBaseLength].TrimEnd('-');

        return $"{truncatedBaseSlug}{suffixText}";
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static (string FirstName, string LastName) SplitFullName(string fullName)
    {
        var normalized = fullName.Trim();
        var separatorIndex = normalized.IndexOf(' ', StringComparison.Ordinal);

        if (separatorIndex < 0)
        {
            return (normalized, string.Empty);
        }

        return (
            normalized[..separatorIndex].Trim(),
            normalized[(separatorIndex + 1)..].Trim());
    }

    private static void EnsureIdentitySucceeded(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = result.Errors.Select(error => error.Description).ToArray();

        throw new ApiException(
            400,
            message,
            string.Join("; ", errors),
            errors);
    }
}
