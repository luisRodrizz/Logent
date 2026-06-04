using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Profile.DTOs;
using InventorySaaS.Application.Profile.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Profile;

public class ProfileService(
    UserManager<ApplicationUser> userManager,
    IAuditLogWriter auditLogWriter) : IProfileService
{
    public async Task<MyProfileResponse> GetProfileAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindActiveUserAsync(userId, cancellationToken);

        return await MapToResponseAsync(user);
    }

    public async Task<MyProfileResponse> UpdateProfileAsync(
        string userId,
        UpdateMyProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await FindActiveUserAsync(userId, cancellationToken);
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        var result = await userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(result, "Could not update profile.");

        await auditLogWriter.WriteAsync(
            user.Id,
            AuditAction.UserProfileUpdated,
            "User",
            user.Id,
            $"User profile updated: {user.Email}",
            cancellationToken,
            user.CompanyId);

        return await MapToResponseAsync(user);
    }

    public async Task ChangePasswordAsync(
        string userId,
        ChangeMyPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await FindActiveUserAsync(userId, cancellationToken);
        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(error => error.Description).ToArray();
            var isPasswordMismatch = result.Errors.Any(error => error.Code == "PasswordMismatch");

            throw new ApiException(
                400,
                isPasswordMismatch ? "Current password is incorrect." : "Could not change password.",
                isPasswordMismatch
                    ? "The current password provided is not valid."
                    : string.Join("; ", errors),
                errors);
        }

        await auditLogWriter.WriteAsync(
            user.Id,
            AuditAction.UserPasswordChanged,
            "User",
            user.Id,
            $"User password changed: {user.Email}",
            cancellationToken,
            user.CompanyId);
    }

    private async Task<ApplicationUser> FindActiveUserAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .Include(item => item.Company)
            .FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

        if (user is null)
        {
            throw new ApiException(
                401,
                "Authentication is required.",
                "You must provide a valid access token.");
        }

        if (!user.IsActive)
        {
            throw new ApiException(
                401,
                "User account is inactive.",
                "Contact an administrator to reactivate this account.");
        }

        return user;
    }

    private async Task<MyProfileResponse> MapToResponseAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);

        return new MyProfileResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = roles,
            CompanyId = user.CompanyId,
            CompanyName = user.Company?.CommercialName ?? user.Company?.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
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
