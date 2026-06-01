using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Plans.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Almacenero,Consulta")]
[Route("api/plan")]
public class PlanController(
    ICurrentUserContext currentUserContext,
    IPlanLimitService planLimitService) : ControllerBase
{
    [HttpGet("usage")]
    public async Task<ActionResult<PlanUsageResponse>> GetUsage(CancellationToken cancellationToken)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return Ok(await planLimitService.GetUsageAsync(companyId, cancellationToken));
    }
}
