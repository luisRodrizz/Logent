using FluentValidation;
using InventorySaaS.Application.Common.Interfaces;
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
    IValidator<UpdateMyProfileRequest> updateProfileValidator,
    IValidator<ChangeMyPasswordRequest> changePasswordValidator,
    ICurrentUserContext currentUserContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<MyProfileResponse>> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await profileService.GetProfileAsync(currentUserContext.RequireUserId(), cancellationToken);

        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<MyProfileResponse>> UpdateProfile(
        UpdateMyProfileRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateProfileValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var profile = await profileService.UpdateProfileAsync(
            currentUserContext.RequireUserId(),
            request,
            cancellationToken);

        return Ok(profile);
    }

    [HttpPut("password")]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        ChangeMyPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await changePasswordValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        await profileService.ChangePasswordAsync(currentUserContext.RequireUserId(), request, cancellationToken);

        return NoContent();
    }
}
