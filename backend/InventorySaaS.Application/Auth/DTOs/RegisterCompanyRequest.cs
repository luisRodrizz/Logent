namespace InventorySaaS.Application.Auth.DTOs;

public class RegisterCompanyRequest
{
    public string CompanyName { get; set; } = string.Empty;

    public string? Ruc { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string AdminFullName { get; set; } = string.Empty;

    public string AdminEmail { get; set; } = string.Empty;

    public string AdminPassword { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
}
