using System.Net;
using FluentValidation;
using InventorySaaS.Application.Common.Email.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/dev/email-test")]
public class EmailTestController(
    IWebHostEnvironment environment,
    IEmailSender emailSender,
    IValidator<SendTestEmailRequest> validator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Send(
        SendTestEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment())
        {
            return NotFound();
        }

        var validationResult = await validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var safeMessage = WebUtility
            .HtmlEncode(request.Message.Trim())
            .Replace("\r\n", "<br />")
            .Replace("\n", "<br />");

        var htmlBody = $"""
            <div style="font-family: Arial, sans-serif; color: #0f172a;">
                <h2 style="margin-bottom: 12px;">LOGENT</h2>
                <p style="line-height: 1.6;">{safeMessage}</p>
            </div>
            """;

        await emailSender.SendEmailAsync(
            request.To.Trim(),
            request.Subject.Trim(),
            htmlBody,
            cancellationToken);

        return Ok(new { message = "Test email sent successfully." });
    }
}
