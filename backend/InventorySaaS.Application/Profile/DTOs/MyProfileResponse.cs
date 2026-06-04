namespace InventorySaaS.Application.Profile.DTOs;

public class MyProfileResponse
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public IList<string> Roles { get; set; } = new List<string>();

    public Guid? CompanyId { get; set; }

    public string? CompanyName { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
