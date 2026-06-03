using InventorySaaS.Application.TenantCompanySettings.DTOs;

namespace InventorySaaS.Application.TenantCompanySettings.Interfaces;

public interface ITenantCompanySettingsService
{
    Task<TenantCompanySettingsResponse> GetCurrentCompanyAsync(CancellationToken cancellationToken = default);

    Task<TenantCompanySettingsResponse> UpdateCurrentCompanyAsync(
        UpdateTenantCompanySettingsRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantCompanySettingsResponse> UploadCurrentCompanyLogoAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<TenantCompanySettingsResponse> DeleteCurrentCompanyLogoAsync(CancellationToken cancellationToken = default);
}
