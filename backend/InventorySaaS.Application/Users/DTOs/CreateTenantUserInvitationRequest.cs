namespace InventorySaaS.Application.Users.DTOs;

public class CreateTenantUserInvitationRequest
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
}
