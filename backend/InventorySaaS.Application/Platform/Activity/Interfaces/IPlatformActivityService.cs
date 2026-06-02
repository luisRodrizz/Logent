using InventorySaaS.Application.Platform.Activity.DTOs;

namespace InventorySaaS.Application.Platform.Activity.Interfaces;

public interface IPlatformActivityService
{
    Task<PlatformActivityListResponse> GetAllAsync(
        PlatformActivityQueryRequest request,
        CancellationToken cancellationToken = default);
}
