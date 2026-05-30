using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InventorySaaS.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace InventorySaaS.Infrastructure.Authentication;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public string GenerateToken(string userId, string email, IEnumerable<string> roles, Guid? companyId = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (companyId.HasValue)
        {
            claims.Add(new Claim("companyId", companyId.Value.ToString()));
        }

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GetRequiredJwtValue("Key")));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: GetRequiredJwtValue("Issuer"),
            audience: GetRequiredJwtValue("Audience"),
            claims: claims,
            expires: GetExpirationTime(),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public DateTime GetExpirationTime()
    {
        var expiresInMinutes = configuration.GetValue<int>("Jwt:ExpiresInMinutes");

        return DateTime.UtcNow.AddMinutes(expiresInMinutes);
    }

    private string GetRequiredJwtValue(string key)
    {
        return configuration[$"Jwt:{key}"]
            ?? throw new InvalidOperationException($"Missing Jwt:{key} configuration.");
    }
}
