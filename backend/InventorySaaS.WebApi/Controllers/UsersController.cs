using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Users.DTOs;
using InventorySaaS.Application.Users.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AuthMessageResponse = InventorySaaS.Application.Auth.DTOs.MessageResponse;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users")]
public class UsersController(
    IUserManagementService userManagementService,
    IValidator<CreateUserRequest> createValidator,
    IValidator<CreateTenantUserInvitationRequest> createInvitationValidator,
    IValidator<AcceptTenantUserInvitationRequest> acceptInvitationValidator,
    IValidator<UpdateUserRequest> updateValidator,
    IValidator<UpdateUserRoleRequest> updateRoleValidator,
    IValidator<ResetPasswordRequest> resetPasswordValidator,
    ICurrentUserContext currentUserContext) : ControllerBase
{
    [HttpGet("invitations")]
    public async Task<ActionResult<IReadOnlyCollection<TenantUserInvitationResponse>>> GetInvitations(
        [FromServices] ITenantUserInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        return Ok(await invitationService.GetAllAsync(cancellationToken));
    }

    [HttpPost("invitations")]
    public async Task<ActionResult<TenantUserInvitationResponse>> CreateInvitation(
        CreateTenantUserInvitationRequest request,
        [FromServices] ITenantUserInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        var validationResult = await createInvitationValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var invitation = await invitationService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetInvitations), invitation);
    }

    [HttpPost("invitations/{id:guid}/resend")]
    public async Task<ActionResult<TenantUserInvitationResponse>> ResendInvitation(
        Guid id,
        [FromServices] ITenantUserInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        return Ok(await invitationService.ResendAsync(id, cancellationToken));
    }

    [HttpPost("invitations/{id:guid}/cancel")]
    public async Task<ActionResult<TenantUserInvitationResponse>> CancelInvitation(
        Guid id,
        [FromServices] ITenantUserInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        return Ok(await invitationService.CancelAsync(id, cancellationToken));
    }

    [AllowAnonymous]
    [HttpGet("invitations/validate")]
    public async Task<ActionResult<ValidateTenantUserInvitationResponse>> ValidateInvitation(
        [FromQuery] string token,
        [FromServices] ITenantUserInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        return Ok(await invitationService.ValidateAsync(token, cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("invitations/accept")]
    public async Task<ActionResult<AuthMessageResponse>> AcceptInvitation(
        AcceptTenantUserInvitationRequest request,
        [FromServices] ITenantUserInvitationService invitationService,
        CancellationToken cancellationToken)
    {
        var validationResult = await acceptInvitationValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        return Ok(await invitationService.AcceptAsync(request, cancellationToken));
    }

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

        var currentUserId = currentUserContext.RequireUserId();

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

        var currentUserId = currentUserContext.RequireUserId();

        var updated = await userManagementService.UpdateAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    [HttpPut("{id}/role")]
    [HttpPatch("{id}/role")]
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

        var currentUserId = currentUserContext.RequireUserId();

        var updated = await userManagementService.UpdateRoleAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    [HttpPut("{id}/status")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
        string id,
        UpdateUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUserContext.RequireUserId();

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

        var currentUserId = currentUserContext.RequireUserId();

        var updated = await userManagementService.ResetPasswordAsync(id, request, currentUserId, cancellationToken);

        return updated ? NoContent() : UserNotFound();
    }

    private ObjectResult UserNotFound()
    {
        return ApiErrorResponseFactory.Result(
            HttpContext,
            StatusCodes.Status404NotFound,
            "User not found.",
            "No user was found with the provided id.");
    }

}
