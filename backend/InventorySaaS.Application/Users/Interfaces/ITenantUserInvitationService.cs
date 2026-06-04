using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Interfaces;

public interface ITenantUserInvitationService
{
    Task<IReadOnlyCollection<TenantUserInvitationResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TenantUserInvitationResponse> CreateAsync(
        CreateTenantUserInvitationRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantUserInvitationResponse> ResendAsync(Guid id, CancellationToken cancellationToken = default);

    Task<TenantUserInvitationResponse> CancelAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ValidateTenantUserInvitationResponse> ValidateAsync(
        string token,
        CancellationToken cancellationToken = default);

    Task<MessageResponse> AcceptAsync(
        AcceptTenantUserInvitationRequest request,
        CancellationToken cancellationToken = default);
}
