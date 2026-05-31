using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Companies.DTOs;

public class PlatformCompanyQueryRequest : PagedRequest
{
    public bool? IsActive { get; set; }

    public PlanType? Plan { get; set; }
}
