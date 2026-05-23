using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Suppliers.DTOs;

namespace InventorySaaS.Application.Suppliers.Interfaces;

public interface ISupplierService
{
    Task<PagedResponse<SupplierResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<SupplierResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<SupplierResponse> CreateAsync(
        CreateSupplierRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(
        Guid id,
        UpdateSupplierRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default);
}
