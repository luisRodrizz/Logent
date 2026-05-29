using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Interfaces;

public interface IUserManagementService
{
    Task<PagedResponse<UserListItemResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<UserDetailResponse?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task<UserDetailResponse> CreateAsync(
        CreateUserRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(
        string id,
        UpdateUserRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateRoleAsync(
        string id,
        UpdateUserRoleRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateStatusAsync(
        string id,
        UpdateUserStatusRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<bool> ResetPasswordAsync(
        string id,
        ResetPasswordRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);
}
