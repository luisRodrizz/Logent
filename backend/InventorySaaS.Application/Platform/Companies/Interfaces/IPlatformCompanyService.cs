using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Platform.Companies.DTOs;

namespace InventorySaaS.Application.Platform.Companies.Interfaces;

public interface IPlatformCompanyService
{
    Task<PagedResponse<PlatformCompanyListItemResponse>> GetAllAsync(
        PlatformCompanyQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<PlatformCompanyDetailResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateStatusAsync(
        Guid id,
        UpdateCompanyStatusRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdatePlanAsync(
        Guid id,
        UpdateCompanyPlanRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);
}
