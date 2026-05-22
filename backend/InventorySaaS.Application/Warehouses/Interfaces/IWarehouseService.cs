using InventorySaaS.Application.Warehouses.DTOs;

namespace InventorySaaS.Application.Warehouses.Interfaces;

public interface IWarehouseService
{
    Task<IReadOnlyList<WarehouseResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<WarehouseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request, CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(Guid id, UpdateWarehouseRequest request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
