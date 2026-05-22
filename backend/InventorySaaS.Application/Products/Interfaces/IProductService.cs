using InventorySaaS.Application.Products.DTOs;

namespace InventorySaaS.Application.Products.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
