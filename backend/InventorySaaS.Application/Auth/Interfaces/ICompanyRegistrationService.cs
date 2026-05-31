using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Interfaces;

public interface ICompanyRegistrationService
{
    Task<MessageResponse> RegisterAsync(
        RegisterCompanyRequest request,
        CancellationToken cancellationToken = default);
}
