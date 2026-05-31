using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Interfaces;

public interface IPasswordRecoveryService
{
    Task<MessageResponse> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default);

    Task<MessageResponse> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken = default);
}
