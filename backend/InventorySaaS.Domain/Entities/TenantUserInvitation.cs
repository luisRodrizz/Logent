using InventorySaaS.Domain.Common;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Domain.Entities;

public class TenantUserInvitation : BaseEntity
{
    public Guid CompanyId { get; set; }

    public Company? Company { get; set; }

    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string TokenHash { get; set; } = string.Empty;

    public TenantUserInvitationStatus Status { get; set; } = TenantUserInvitationStatus.Pending;

    public DateTime ExpiresAt { get; set; }

    public DateTime? AcceptedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string CreatedByUserId { get; set; } = string.Empty;

    public DateTime? CancelledAt { get; set; }

    public string? CancelledByUserId { get; set; }
}
