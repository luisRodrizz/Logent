using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Users.DTOs;
using InventorySaaS.Application.Users.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Users;

public class UserManagementService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IAuditLogWriter auditLogWriter) : IUserManagementService
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.Ordinal)
    {
        IdentitySeeder.AdminRole,
        IdentitySeeder.WarehouseRole,
        IdentitySeeder.ReadOnlyRole
    };

    public async Task<PagedResponse<UserListItemResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = userManager.Users.AsNoTracking();
        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                user =>
                    (user.Email != null && user.Email.ToLower().Contains(search))
                    || user.FirstName.ToLower().Contains(search)
                    || user.LastName.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var users = await query
            .OrderBy(user => user.Email)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<UserListItemResponse>();

        foreach (var user in users)
        {
            items.Add(await MapToListItemAsync(user));
        }

        return items.ToPagedResponse(request, totalCount);
    }

    public async Task<UserDetailResponse?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        return user is null ? null : await MapToDetailAsync(user);
    }

    public async Task<UserDetailResponse> CreateAsync(
        CreateUserRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var role = await NormalizeAndValidateRoleAsync(request.Role);
        var email = NormalizeEmail(request.Email);

        await EnsureEmailIsUniqueAsync(email, excludedUserId: null);

        var name = SplitFullName(request.FullName);
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = name.FirstName,
            LastName = name.LastName,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        EnsureIdentitySucceeded(createResult, "Could not create user.");

        var roleResult = await userManager.AddToRoleAsync(user, role);
        EnsureIdentitySucceeded(roleResult, "Could not assign user role.");

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.UserCreated,
            "User",
            user.Id,
            $"User created: {email} ({role})",
            cancellationToken);

        return await MapToDetailAsync(user);
    }

    public async Task<bool> UpdateAsync(
        string id,
        UpdateUserRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        if (user is null)
        {
            return false;
        }

        var email = NormalizeEmail(request.Email);

        await EnsureEmailIsUniqueAsync(email, id);
        await EnsureCanChangeAdminAvailabilityAsync(user, newIsActive: request.IsActive);

        var name = SplitFullName(request.FullName);
        user.FirstName = name.FirstName;
        user.LastName = name.LastName;
        user.IsActive = request.IsActive;

        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase))
        {
            user.Email = email;
            user.UserName = email;
            user.NormalizedEmail = userManager.NormalizeEmail(email);
            user.NormalizedUserName = userManager.NormalizeName(email);
        }

        var updateResult = await userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(updateResult, "Could not update user.");

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.UserUpdated,
            "User",
            user.Id,
            $"User updated: {email}",
            cancellationToken);

        return true;
    }

    public async Task<bool> UpdateRoleAsync(
        string id,
        UpdateUserRoleRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        if (user is null)
        {
            return false;
        }

        var newRole = await NormalizeAndValidateRoleAsync(request.Role);
        var roles = await userManager.GetRolesAsync(user);
        var currentRole = roles.FirstOrDefault() ?? string.Empty;

        if (string.Equals(currentRole, newRole, StringComparison.Ordinal))
        {
            return true;
        }

        await EnsureCanChangeAdminRoleAsync(user, newRole);

        if (roles.Count > 0)
        {
            var removeResult = await userManager.RemoveFromRolesAsync(user, roles);
            EnsureIdentitySucceeded(removeResult, "Could not remove current user role.");
        }

        var addResult = await userManager.AddToRoleAsync(user, newRole);
        EnsureIdentitySucceeded(addResult, "Could not assign user role.");

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.UserRoleChanged,
            "User",
            user.Id,
            $"User role changed: {user.Email} from {currentRole} to {newRole}",
            cancellationToken);

        return true;
    }

    public async Task<bool> UpdateStatusAsync(
        string id,
        UpdateUserStatusRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        if (user is null)
        {
            return false;
        }

        await EnsureCanChangeAdminAvailabilityAsync(user, request.IsActive);

        user.IsActive = request.IsActive;
        var updateResult = await userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(updateResult, "Could not update user status.");

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.UserStatusChanged,
            "User",
            user.Id,
            $"User status changed: {user.Email} active={request.IsActive}",
            cancellationToken);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(
        string id,
        ResetPasswordRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        if (user is null)
        {
            return false;
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var resetResult = await userManager.ResetPasswordAsync(user, token, request.NewPassword);
        EnsureIdentitySucceeded(resetResult, "Could not reset user password.");

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.UserPasswordReset,
            "User",
            user.Id,
            $"User password reset: {user.Email}",
            cancellationToken);

        return true;
    }

    private async Task<ApplicationUser?> FindUserAsync(string id, CancellationToken cancellationToken)
    {
        return await userManager.Users.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
    }

    private async Task<UserListItemResponse> MapToListItemAsync(ApplicationUser user)
    {
        var role = await GetPrimaryRoleAsync(user);

        return new UserListItemResponse
        {
            Id = user.Id,
            FullName = GetFullName(user),
            Email = user.Email ?? string.Empty,
            Role = role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    private async Task<UserDetailResponse> MapToDetailAsync(ApplicationUser user)
    {
        var role = await GetPrimaryRoleAsync(user);

        return new UserDetailResponse
        {
            Id = user.Id,
            FullName = GetFullName(user),
            Email = user.Email ?? string.Empty,
            Role = role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    private async Task<string> GetPrimaryRoleAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);

        return roles.FirstOrDefault() ?? string.Empty;
    }

    private static string GetFullName(ApplicationUser user)
    {
        return $"{user.FirstName} {user.LastName}".Trim();
    }

    private static (string FirstName, string LastName) SplitFullName(string fullName)
    {
        var normalized = fullName.Trim();
        var separatorIndex = normalized.IndexOf(' ', StringComparison.Ordinal);

        if (separatorIndex < 0)
        {
            return (normalized, string.Empty);
        }

        return (
            normalized[..separatorIndex].Trim(),
            normalized[(separatorIndex + 1)..].Trim());
    }

    private async Task<string> NormalizeAndValidateRoleAsync(string role)
    {
        var normalizedRole = role.Trim();

        if (!AllowedRoles.Contains(normalizedRole))
        {
            throw new ApiException(
                400,
                "Invalid role.",
                $"Role must be one of: {string.Join(", ", AllowedRoles)}.");
        }

        if (!await roleManager.RoleExistsAsync(normalizedRole))
        {
            throw new ApiException(
                400,
                "Invalid role.",
                $"Role must be one of: {string.Join(", ", AllowedRoles)}.");
        }

        return normalizedRole;
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim();
    }

    private async Task EnsureEmailIsUniqueAsync(string email, string? excludedUserId)
    {
        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null && existingUser.Id != excludedUserId)
        {
            throw new ApiException(
                400,
                "A user with this email already exists.",
                "A user with this email already exists.");
        }
    }

    private async Task EnsureCanChangeAdminAvailabilityAsync(ApplicationUser user, bool newIsActive)
    {
        if (newIsActive || !await userManager.IsInRoleAsync(user, IdentitySeeder.AdminRole))
        {
            return;
        }

        await EnsureMoreThanOneActiveAdminAsync();
    }

    private async Task EnsureCanChangeAdminRoleAsync(ApplicationUser user, string newRole)
    {
        if (string.Equals(newRole, IdentitySeeder.AdminRole, StringComparison.Ordinal)
            || !user.IsActive
            || !await userManager.IsInRoleAsync(user, IdentitySeeder.AdminRole))
        {
            return;
        }

        await EnsureMoreThanOneActiveAdminAsync();
    }

    private async Task EnsureMoreThanOneActiveAdminAsync()
    {
        var adminUsers = await userManager.GetUsersInRoleAsync(IdentitySeeder.AdminRole);
        var activeAdminCount = adminUsers.Count(user => user.IsActive);

        if (activeAdminCount <= 1)
        {
            throw new ApiException(
                400,
                "At least one active Admin user must remain available.",
                "You cannot deactivate or remove the Admin role from the last active Admin user.");
        }
    }

    private static void EnsureIdentitySucceeded(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error => error.Description));

        throw new ApiException(
            400,
            message,
            errors,
            result.Errors.Select(error => error.Description));
    }
}
