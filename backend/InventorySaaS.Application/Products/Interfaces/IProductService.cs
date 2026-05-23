using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Products.DTOs;

namespace InventorySaaS.Application.Products.Interfaces;

public interface IProductService
{
    Task<PagedResponse<ProductResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ProductResponse> CreateAsync(
        CreateProductRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default);
}
