using System.Net;
using System.Text;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Auth.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Authentication;

public class EmailConfirmationService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    IEmailSender emailSender,
    IOptions<AppUrlSettings> appUrlSettings) : IEmailConfirmationService
{
    private const string GenericResendMessage =
        "Si el correo está registrado y pendiente de confirmación, enviaremos un nuevo enlace.";

    private readonly AppUrlSettings urls = appUrlSettings.Value;

    public async Task SendConfirmationEmailAsync(
        string userId,
        string companyName,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("The email confirmation user could not be loaded.");
        var email = user.Email
            ?? throw new InvalidOperationException("The email confirmation user does not have an email address.");
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmationUrl = BuildConfirmationUrl(user.Id, token);
        var emailBody = BuildConfirmationEmailBody(GetFullName(user), companyName, confirmationUrl);

        await emailSender.SendEmailAsync(
            email,
            "Confirma tu correo en LOGENT",
            emailBody,
            cancellationToken);
    }

    public async Task<MessageResponse> ConfirmEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default)
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
            throw InvalidConfirmationToken();
        }

        var confirmationResult = await userManager.ConfirmEmailAsync(user, decodedToken);

        if (!confirmationResult.Succeeded)
        {
            throw InvalidConfirmationToken(confirmationResult.Errors.Select(error => error.Description));
        }

        return new MessageResponse
        {
            Message = "Correo confirmado correctamente."
        };
    }

    public async Task<MessageResponse> ResendConfirmationEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(email.Trim());

        if (user is null || !user.IsActive)
        {
            return new MessageResponse
            {
                Message = GenericResendMessage
            };
        }

        if (user.EmailConfirmed)
        {
            return new MessageResponse
            {
                Message = "El correo ya está confirmado."
            };
        }

        var companyName = await GetCompanyNameAsync(user.CompanyId, cancellationToken);

        await SendConfirmationEmailAsync(user.Id, companyName, cancellationToken);

        return new MessageResponse
        {
            Message = GenericResendMessage
        };
    }

    private async Task<string> GetCompanyNameAsync(Guid? companyId, CancellationToken cancellationToken)
    {
        if (!companyId.HasValue)
        {
            return "tu empresa";
        }

        return await context.Companies
            .AsNoTracking()
            .Where(company => company.Id == companyId.Value)
            .Select(company => company.Name)
            .FirstOrDefaultAsync(cancellationToken)
            ?? "tu empresa";
    }

    private string BuildConfirmationUrl(string userId, string token)
    {
        if (string.IsNullOrWhiteSpace(urls.FrontendBaseUrl))
        {
            throw new InvalidOperationException("Application URL settings are not configured. Configure AppUrls:FrontendBaseUrl.");
        }

        var encodedUserId = Uri.EscapeDataString(userId);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        return $"{urls.FrontendBaseUrl.TrimEnd('/')}/confirm-email?userId={encodedUserId}&token={encodedToken}";
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

    private static string GetFullName(ApplicationUser user)
    {
        return $"{user.FirstName} {user.LastName}".Trim();
    }

    private static ApiException InvalidConfirmationToken(IEnumerable<string>? errors = null)
    {
        return new ApiException(
            400,
            "Invalid email confirmation token.",
            "The email confirmation token is not valid.",
            errors);
    }
}
