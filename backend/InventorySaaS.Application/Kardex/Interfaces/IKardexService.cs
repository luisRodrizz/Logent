using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Kardex.DTOs;

namespace InventorySaaS.Application.Kardex.Interfaces;

public interface IKardexService
{
    Task<PagedResponse<KardexEntryResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

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
