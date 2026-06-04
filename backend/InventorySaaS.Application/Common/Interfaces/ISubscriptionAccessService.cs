using InventorySaaS.Application.Common.DTOs;

namespace InventorySaaS.Application.Common.Interfaces;

public interface ISubscriptionAccessService
{
    Task<SubscriptionAccessDecision> GetAccessAsync(
        Guid companyId,
        CancellationToken cancellationToken = default);

    Task EnsureCanPerformCriticalWriteAsync(
        Guid companyId,
        CancellationToken cancellationToken = default);
}
