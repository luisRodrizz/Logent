using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Categories.DTOs;

namespace InventorySaaS.Application.Categories.Interfaces;

public interface ICategoryService
{
    Task<PagedResponse<CategoryResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<CategoryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<CategoryResponse> CreateAsync(
        CreateCategoryRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(
        Guid id,
        UpdateCategoryRequest request,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default);
}
