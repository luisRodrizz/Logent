using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Movements.DTOs;

namespace InventorySaaS.Application.Movements.Interfaces;

public interface IMovementService
{
    Task<PagedResponse<MovementResponse>> GetAllAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<MovementResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<MovementResponse> CreateAsync(
        CreateMovementRequest request,
        string userId,
        CancellationToken cancellationToken = default);
}
