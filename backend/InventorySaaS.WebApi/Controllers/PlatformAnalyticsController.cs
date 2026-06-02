using InventorySaaS.Application.Platform.Analytics.DTOs;
using InventorySaaS.Application.Platform.Analytics.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.SuperAdminRole)]
[Route("api/platform/analytics")]
public class PlatformAnalyticsController(IPlatformAnalyticsService platformAnalyticsService) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<PlatformAnalyticsSummaryResponse>> GetSummary(CancellationToken cancellationToken)
    {
        return Ok(await platformAnalyticsService.GetSummaryAsync(cancellationToken));
    }
}
