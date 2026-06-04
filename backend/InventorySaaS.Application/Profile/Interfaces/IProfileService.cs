using InventorySaaS.Application.Profile.DTOs;

namespace InventorySaaS.Application.Profile.Interfaces;

public interface IProfileService
{
    Task<MyProfileResponse> GetProfileAsync(string userId, CancellationToken cancellationToken = default);

    Task<MyProfileResponse> UpdateProfileAsync(
        string userId,
        UpdateMyProfileRequest request,
        CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(
        string userId,
        ChangeMyPasswordRequest request,
        CancellationToken cancellationToken = default);
}
