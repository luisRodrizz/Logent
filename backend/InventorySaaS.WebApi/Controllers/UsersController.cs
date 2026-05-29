using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Users.DTOs;
using InventorySaaS.Application.Users.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users")]
public class UsersController(
    IUserManagementService userManagementService,
    IValidator<CreateUserRequest> createValidator,
    IValidator<UpdateUserRequest> updateValidator,
    IValidator<UpdateUserRoleRequest> updateRoleValidator,
    IValidator<ResetPasswordRequest> resetPasswordValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<UserListItemResponse>>> GetAll(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var users = await userManagementService.GetAllAsync(request, cancellationToken);

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDetailResponse>> GetById(string id, CancellationToken cancellationToken)
    {
        var user = await userManagementService.GetByIdAsync(id, cancellationToken);

        return user is null ? UserNotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDetailResponse>> Create(
        CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await createValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return UnauthorizedResponse();
        }

        var user = await userManagementService.CreateAsync(request, currentUserId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        string id,
        UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return UnauthorizedResponse();
        }

        var updated = await userManagementService.UpdateAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(
        string id,
        UpdateUserRoleRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateRoleValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return UnauthorizedResponse();
        }

        var updated = await userManagementService.UpdateRoleAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
        string id,
        UpdateUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return UnauthorizedResponse();
        }

        var updated = await userManagementService.UpdateStatusAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(
        string id,
        ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await resetPasswordValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return UnauthorizedResponse();
        }

        var updated = await userManagementService.ResetPasswordAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }

    private ObjectResult UserNotFound()
    {
        return ApiErrorResponseFactory.Result(
            HttpContext,
            StatusCodes.Status404NotFound,
            "User not found.",
            "No user was found with the provided id.");
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
