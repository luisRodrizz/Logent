using InventorySaaS.Application.Suppliers.DTOs;

namespace InventorySaaS.Application.Suppliers.Interfaces;

public interface ISupplierService
{
    Task<IReadOnlyList<SupplierResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<SupplierResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<SupplierResponse> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
