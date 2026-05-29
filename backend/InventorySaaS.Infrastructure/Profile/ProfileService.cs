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
    public async Task<ProfileResponse> GetProfileAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindActiveUserAsync(userId, cancellationToken);
        var roles = await userManager.GetRolesAsync(user);

        return new ProfileResponse
        {
            Id = user.Id,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Email = user.Email ?? string.Empty,
            Role = roles.FirstOrDefault() ?? string.Empty,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request,
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
            AuditAction.ProfilePasswordChanged,
            "User",
            user.Id,
            $"Profile password changed: {user.Email}",
            cancellationToken);
    }

    private async Task<ApplicationUser> FindActiveUserAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

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
}
