using InventorySaaS.Application.Platform.Activity.DTOs;
using InventorySaaS.Application.Platform.Activity.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.SuperAdminRole)]
[Route("api/platform/activity")]
public class PlatformActivityController(IPlatformActivityService platformActivityService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PlatformActivityListResponse>> GetAll(
        [FromQuery] PlatformActivityQueryRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await platformActivityService.GetAllAsync(request, cancellationToken));
    }
}
