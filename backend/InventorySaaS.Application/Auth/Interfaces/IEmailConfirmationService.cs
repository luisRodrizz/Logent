using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Interfaces;

public interface IEmailConfirmationService
{
    Task SendConfirmationEmailAsync(
        string userId,
        string companyName,
        CancellationToken cancellationToken = default);

    Task<MessageResponse> ConfirmEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default);

    Task<MessageResponse> ResendConfirmationEmailAsync(
        string email,
        CancellationToken cancellationToken = default);
}
