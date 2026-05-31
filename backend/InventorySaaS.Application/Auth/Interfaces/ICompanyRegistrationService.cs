using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Interfaces;

public interface ICompanyRegistrationService
{
    Task<AuthResponse> RegisterAsync(
        RegisterCompanyRequest request,
        CancellationToken cancellationToken = default);

    Task<MessageResponse> ConfirmEmailAsync(
        string userId,
        string token);
}
