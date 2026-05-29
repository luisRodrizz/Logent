using InventorySaaS.Application.Profile.DTOs;

namespace InventorySaaS.Application.Profile.Interfaces;

public interface IProfileService
{
    Task<ProfileResponse> GetProfileAsync(string userId, CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default);
}
