using InventorySaaS.Application.Kardex.DTOs;

namespace InventorySaaS.Application.Kardex.Interfaces;

public interface IKardexService
{
    Task<IReadOnlyList<KardexEntryResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<KardexEntryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<KardexEntryResponse>> GetByProductAsync(
        Guid productId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<KardexEntryResponse>> GetByWarehouseAsync(
        Guid warehouseId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<KardexEntryResponse>> GetByProductAndWarehouseAsync(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken = default);
}
