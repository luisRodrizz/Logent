using InventorySaaS.Application.Platform.Dashboard.DTOs;
using InventorySaaS.Application.Platform.Dashboard.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.SuperAdminRole)]
[Route("api/platform/dashboard")]
public class PlatformDashboardController(IPlatformDashboardService platformDashboardService) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<PlatformDashboardSummaryResponse>> GetSummary(CancellationToken cancellationToken)
    {
        return Ok(await platformDashboardService.GetSummaryAsync(cancellationToken));
    }
}
