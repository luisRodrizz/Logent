using InventorySaaS.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace InventorySaaS.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
