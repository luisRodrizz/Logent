using System.Net;
using System.Text;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Auth.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Authentication;

public class PasswordRecoveryService(
    UserManager<ApplicationUser> userManager,
    IEmailSender emailSender,
    IOptions<AppUrlSettings> appUrlSettings,
    ILogger<PasswordRecoveryService> logger) : IPasswordRecoveryService
{
    private const string GenericForgotPasswordMessage =
        "Si el correo está registrado, enviaremos instrucciones para restablecer la contraseña.";

    private readonly AppUrlSettings urls = appUrlSettings.Value;

    public async Task<MessageResponse> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());

        if (user is null || !user.IsActive)
        {
            return GenericForgotPasswordResponse();
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var resetUrl = BuildResetPasswordUrl(user.Email ?? request.Email.Trim(), token);
        var emailBody = BuildResetPasswordEmailBody(GetFullName(user), resetUrl);

        await emailSender.SendEmailAsync(
            user.Email ?? request.Email.Trim(),
            "Restablece tu contraseña en LOGENT",
            emailBody,
            cancellationToken);

        logger.LogInformation("Password recovery instructions sent for user {UserId}.", user.Id);

        return GenericForgotPasswordResponse();
    }

    public async Task<MessageResponse> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());

        if (user is null || !user.IsActive)
        {
            throw InvalidPasswordResetToken();
        }

        string decodedToken;

        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch (FormatException)
        {
            throw InvalidPasswordResetToken();
        }

        var resetResult = await userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);

        if (!resetResult.Succeeded)
        {
            throw InvalidPasswordResetToken(resetResult.Errors.Select(error => error.Description));
        }

        logger.LogInformation("Password reset completed for user {UserId}.", user.Id);

        return new MessageResponse
        {
            Message = "Contraseña restablecida correctamente."
        };
    }

    private string BuildResetPasswordUrl(string email, string token)
    {
        if (string.IsNullOrWhiteSpace(urls.FrontendBaseUrl))
        {
            throw new InvalidOperationException("Application URL settings are not configured. Configure AppUrls:FrontendBaseUrl.");
        }

        var encodedEmail = Uri.EscapeDataString(email);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        return $"{urls.FrontendBaseUrl.TrimEnd('/')}/reset-password?email={encodedEmail}&token={encodedToken}";
    }

    private static string BuildResetPasswordEmailBody(string fullName, string resetUrl)
    {
        var safeFullName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(fullName) ? "usuario" : fullName);
        var safeResetUrl = WebUtility.HtmlEncode(resetUrl);

        return $"""
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                <h2 style="margin-bottom: 16px;">Restablece tu contraseña en LOGENT</h2>
                <p>Hola, {safeFullName}.</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p style="margin: 24px 0;">
                    <a href="{safeResetUrl}" style="display: inline-block; border-radius: 6px; background: #1017d8; color: #ffffff; padding: 12px 18px; text-decoration: none;">
                        Restablecer contraseña
                    </a>
                </p>
                <p>Si el botón no funciona, abre este enlace:</p>
                <p><a href="{safeResetUrl}">{safeResetUrl}</a></p>
                <p>Si no solicitaste este cambio, ignora este mensaje.</p>
            </div>
            """;
    }

    private static MessageResponse GenericForgotPasswordResponse()
    {
        return new MessageResponse
        {
            Message = GenericForgotPasswordMessage
        };
    }

    private static string GetFullName(ApplicationUser user)
    {
        return $"{user.FirstName} {user.LastName}".Trim();
    }

    private static ApiException InvalidPasswordResetToken(IEnumerable<string>? errors = null)
    {
        return new ApiException(
            400,
            "No se pudo restablecer la contraseña.",
            "El enlace de recuperación es inválido o ha expirado.",
            errors);
    }
}
