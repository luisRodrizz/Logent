using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Profile.DTOs;
using InventorySaaS.Application.Profile.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController(
    IProfileService profileService,
    IValidator<ChangePasswordRequest> changePasswordValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ProfileResponse>> GetProfile(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return UnauthorizedResponse();
        }

        var profile = await profileService.GetProfileAsync(userId, cancellationToken);

        return Ok(profile);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await changePasswordValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return UnauthorizedResponse();
        }

        await profileService.ChangePasswordAsync(userId, request, cancellationToken);

        return NoContent();
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }

    private ObjectResult UnauthorizedResponse()
    {
        return ApiErrorResponseFactory.Result(
            HttpContext,
            StatusCodes.Status401Unauthorized,
            "Authentication is required.",
            "You must provide a valid access token.");
    }
}
