using InventorySaaS.Application.Warehouses.DTOs;

namespace InventorySaaS.Application.Warehouses.Interfaces;

public interface IWarehouseService
{
    Task<IReadOnlyList<WarehouseResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<WarehouseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<WarehouseResponse> CreateAsync(
        CreateWarehouseRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(
        Guid id,
        UpdateWarehouseRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default);
}
