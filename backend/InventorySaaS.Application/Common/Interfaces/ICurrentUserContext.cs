namespace InventorySaaS.Application.Common.Interfaces;

public interface ICurrentUserContext
{
    string? UserId { get; }

    string? Email { get; }

    IReadOnlyCollection<string> Roles { get; }

    Guid? CompanyId { get; }

    bool IsAuthenticated { get; }

    bool IsSuperAdmin { get; }

    bool IsTenantUser { get; }

    string RequireUserId();

    Guid RequireCompanyId();
}
