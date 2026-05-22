using InventorySaaS.Application.StockItems.DTOs;

namespace InventorySaaS.Application.StockItems.Interfaces;

public interface IStockItemService
{
    Task<IReadOnlyList<StockItemResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<StockItemResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StockItemResponse>> GetByProductAsync(
        Guid productId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StockItemResponse>> GetByWarehouseAsync(
        Guid warehouseId,
        CancellationToken cancellationToken = default);

    Task<StockItemResponse?> GetByProductAndWarehouseAsync(
        Guid productId,
        Guid warehouseId,
        CancellationToken cancellationToken = default);
}
