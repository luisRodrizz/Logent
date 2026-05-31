using System.Net;
using System.Net.Mail;
using InventorySaaS.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Email;

public class SmtpEmailSender(
    IOptions<EmailSettings> emailSettings,
    ILogger<SmtpEmailSender> logger) : IEmailSender
{
    private readonly EmailSettings settings = emailSettings.Value;

    public async Task SendEmailAsync(
        string to,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        ValidateSettings();

        using var message = new MailMessage
        {
            From = new MailAddress(settings.FromEmail, settings.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        message.To.Add(new MailAddress(to));

        using var smtpClient = new SmtpClient(settings.Host, settings.Port)
        {
            EnableSsl = settings.EnableSsl,
            UseDefaultCredentials = false
        };

        if (!string.IsNullOrWhiteSpace(settings.UserName))
        {
            smtpClient.Credentials = new NetworkCredential(settings.UserName, settings.Password);
        }

        try
        {
            await smtpClient.SendMailAsync(message, cancellationToken);

            logger.LogInformation("Email sent successfully to {Recipient}.", to);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "SMTP email delivery failed for recipient {Recipient} using host {Host}:{Port}.",
                to,
                settings.Host,
                settings.Port);

            throw;
        }
    }

    private void ValidateSettings()
    {
        if (string.IsNullOrWhiteSpace(settings.Host))
        {
            throw new InvalidOperationException("SMTP email settings are not configured. Configure EmailSettings:Host.");
        }

        if (settings.Port <= 0)
        {
            throw new InvalidOperationException("SMTP email settings are invalid. Configure a positive EmailSettings:Port.");
        }

        if (string.IsNullOrWhiteSpace(settings.FromEmail))
        {
            throw new InvalidOperationException("SMTP email settings are not configured. Configure EmailSettings:FromEmail.");
        }
    }
}
