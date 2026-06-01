using InventorySaaS.Domain.Common;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Domain.Entities;

public class PlanUpgradeRequest : BaseEntity
{
    public Guid CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public PlanType RequestedPlan { get; set; }

    public PlanType CurrentPlan { get; set; }

    public PlanUpgradeRequestStatus Status { get; set; } = PlanUpgradeRequestStatus.Pending;

    public string? Message { get; set; }

    public string? ResolutionNote { get; set; }

    public string RequestedByUserId { get; set; } = string.Empty;

    public string? ResolvedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }
}
