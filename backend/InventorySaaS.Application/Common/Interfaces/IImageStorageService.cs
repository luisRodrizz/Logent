using InventorySaaS.Application.Common.DTOs;

namespace InventorySaaS.Application.Common.Interfaces;

public interface IImageStorageService
{
    Task<ImageUploadResult> UploadCompanyLogoAsync(
        Guid companyId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task DeleteCompanyLogoAsync(Guid companyId, CancellationToken cancellationToken = default);
}
