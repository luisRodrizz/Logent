using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;

namespace InventorySaaS.WebApi.Services;

public class CurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    private const string CompanyIdClaimType = "companyId";
    private const string SuperAdminRole = "SuperAdmin";

    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public string? UserId => GetClaimValue(ClaimTypes.NameIdentifier) ?? GetClaimValue(JwtRegisteredClaimNames.Sub);

    public string? Email => GetClaimValue(ClaimTypes.Email) ?? GetClaimValue(JwtRegisteredClaimNames.Email);

    public IReadOnlyCollection<string> Roles => User?
        .Claims
        .Where(claim => claim.Type is ClaimTypes.Role or "role")
        .Select(claim => claim.Value)
        .Where(role => !string.IsNullOrWhiteSpace(role))
        .Distinct(StringComparer.Ordinal)
        .ToArray()
        ?? [];

    public Guid? CompanyId
    {
        get
        {
            var value = GetClaimValue(CompanyIdClaimType);

            return Guid.TryParse(value, out var companyId) ? companyId : null;
        }
    }

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public bool IsSuperAdmin => Roles.Contains(SuperAdminRole, StringComparer.Ordinal);

    public bool IsTenantUser => CompanyId.HasValue && !IsSuperAdmin;

    public string RequireUserId()
    {
        if (!IsAuthenticated || string.IsNullOrWhiteSpace(UserId))
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                "You must provide a valid access token.");
        }

        return UserId;
    }

    public Guid RequireCompanyId()
    {
        RequireUserId();

        if (!CompanyId.HasValue)
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "Company context is required.",
                "The authenticated user is not associated with a company.");
        }

        return CompanyId.Value;
    }

    private string? GetClaimValue(string claimType)
    {
        return User?.FindFirstValue(claimType);
    }
}
