using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.PlanUpgradeRequests.DTOs;

namespace InventorySaaS.Application.PlanUpgradeRequests.Interfaces;

public interface IPlanUpgradeRequestService
{
    Task<PlanUpgradeRequestResponse> CreateTenantRequestAsync(
        Guid companyId,
        string currentUserId,
        CreatePlanUpgradeRequestRequest request,
        CancellationToken cancellationToken = default);

    Task<PlanUpgradeRequestResponse?> GetMyLatestAsync(
        Guid companyId,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<PlatformPlanUpgradeRequestListItemResponse>> GetPlatformRequestsAsync(
        PlatformPlanUpgradeRequestQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<PlatformPlanUpgradeRequestDetailResponse?> GetPlatformDetailAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<bool> ApproveAsync(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<bool> RejectAsync(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default);
}
