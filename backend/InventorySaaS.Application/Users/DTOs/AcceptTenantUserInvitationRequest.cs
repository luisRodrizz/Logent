namespace InventorySaaS.Application.Users.DTOs;

public class AcceptTenantUserInvitationRequest
{
    public string Token { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
}
