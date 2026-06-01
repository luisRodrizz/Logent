using InventorySaaS.Application.Plans.DTOs;

namespace InventorySaaS.Application.Common.Interfaces;

public interface IPlanLimitService
{
    Task<PlanUsageResponse> GetUsageAsync(Guid companyId, CancellationToken cancellationToken = default);

    Task EnsureCanCreateUserAsync(Guid companyId, CancellationToken cancellationToken = default);

    Task EnsureCanCreateProductAsync(Guid companyId, CancellationToken cancellationToken = default);

    Task EnsureCanCreateWarehouseAsync(Guid companyId, CancellationToken cancellationToken = default);

    Task EnsureCanCreateSupplierAsync(Guid companyId, CancellationToken cancellationToken = default);

    Task EnsureCanCreateCategoryAsync(Guid companyId, CancellationToken cancellationToken = default);
}
