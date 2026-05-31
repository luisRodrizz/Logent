using System.Globalization;
using System.Net;
using System.Text;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Auth.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Authentication;

public class CompanyRegistrationService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IJwtTokenService jwtTokenService,
    IEmailSender emailSender,
    IOptions<AppUrlSettings> appUrlSettings) : ICompanyRegistrationService
{
    private const int MaximumSlugLength = 80;
    private readonly AppUrlSettings urls = appUrlSettings.Value;

    public async Task<AuthResponse> RegisterAsync(
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
        ApplicationUser adminUser;
        IList<string> roles;

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
            adminUser = new ApplicationUser
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

            var confirmationToken = await userManager.GenerateEmailConfirmationTokenAsync(adminUser);
            var confirmationUrl = BuildConfirmationUrl(adminUser.Id, confirmationToken);
            var emailBody = BuildConfirmationEmailBody(GetFullName(adminUser), companyName, confirmationUrl);

            await emailSender.SendEmailAsync(
                adminEmail,
                "Confirma tu correo en LOGENT",
                emailBody,
                cancellationToken);

            roles = await userManager.GetRolesAsync(adminUser);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(adminUser.Id, adminEmail, roles, adminUser.CompanyId),
            Email = adminEmail,
            FullName = GetFullName(adminUser),
            Roles = roles,
            ExpiresAt = jwtTokenService.GetExpirationTime()
        };
    }

    public async Task<MessageResponse> ConfirmEmailAsync(string userId, string token)
    {
        var user = await userManager.FindByIdAsync(userId);

        if (user is null)
        {
            throw new ApiException(
                404,
                "User not found.",
                "No user was found with the provided id.");
        }

        if (user.EmailConfirmed)
        {
            return new MessageResponse
            {
                Message = "El correo ya estaba confirmado."
            };
        }

        string decodedToken;

        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        }
        catch (FormatException)
        {
            throw new ApiException(
                400,
                "Invalid email confirmation token.",
                "The email confirmation token is not valid.");
        }

        var confirmationResult = await userManager.ConfirmEmailAsync(user, decodedToken);

        if (!confirmationResult.Succeeded)
        {
            throw new ApiException(
                400,
                "Invalid email confirmation token.",
                "The email confirmation token is not valid.",
                confirmationResult.Errors.Select(error => error.Description));
        }

        return new MessageResponse
        {
            Message = "Correo confirmado correctamente."
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

    private static string GetFullName(ApplicationUser user)
    {
        return $"{user.FirstName} {user.LastName}".Trim();
    }

    private string BuildConfirmationUrl(string userId, string token)
    {
        if (string.IsNullOrWhiteSpace(urls.BackendBaseUrl))
        {
            throw new InvalidOperationException("Application URL settings are not configured. Configure AppUrls:BackendBaseUrl.");
        }

        var encodedUserId = Uri.EscapeDataString(userId);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        return $"{urls.BackendBaseUrl.TrimEnd('/')}/api/auth/confirm-email?userId={encodedUserId}&token={encodedToken}";
    }

    private static string BuildConfirmationEmailBody(
        string adminFullName,
        string companyName,
        string confirmationUrl)
    {
        var safeAdminFullName = WebUtility.HtmlEncode(adminFullName);
        var safeCompanyName = WebUtility.HtmlEncode(companyName);
        var safeConfirmationUrl = WebUtility.HtmlEncode(confirmationUrl);

        return $"""
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                <h2 style="margin-bottom: 16px;">Confirma tu correo en LOGENT</h2>
                <p>Hola, {safeAdminFullName}.</p>
                <p>La empresa <strong>{safeCompanyName}</strong> fue registrada correctamente en LOGENT.</p>
                <p>Confirma tu correo para completar la verificación de tu cuenta administrativa.</p>
                <p style="margin: 24px 0;">
                    <a href="{safeConfirmationUrl}" style="display: inline-block; border-radius: 6px; background: #1017d8; color: #ffffff; padding: 12px 18px; text-decoration: none;">
                        Confirmar correo
                    </a>
                </p>
                <p>Si el botón no funciona, abre este enlace:</p>
                <p><a href="{safeConfirmationUrl}">{safeConfirmationUrl}</a></p>
                <p>Si no solicitaste este registro, ignora este mensaje.</p>
            </div>
            """;
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
