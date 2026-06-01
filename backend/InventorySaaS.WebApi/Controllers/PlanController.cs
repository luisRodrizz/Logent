using FluentValidation;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.PlanUpgradeRequests.DTOs;
using InventorySaaS.Application.PlanUpgradeRequests.Interfaces;
using InventorySaaS.Application.Plans.DTOs;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Almacenero,Consulta")]
[Route("api/plan")]
public class PlanController(
    ICurrentUserContext currentUserContext,
    IPlanLimitService planLimitService,
    IPlanUpgradeRequestService planUpgradeRequestService,
    IValidator<CreatePlanUpgradeRequestRequest> createUpgradeRequestValidator) : ControllerBase
{
    [HttpGet("usage")]
    public async Task<ActionResult<PlanUsageResponse>> GetUsage(CancellationToken cancellationToken)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return Ok(await planLimitService.GetUsageAsync(companyId, cancellationToken));
    }

    [HttpPost("upgrade-requests")]
    public async Task<ActionResult<PlanUpgradeRequestResponse>> CreateUpgradeRequest(
        CreatePlanUpgradeRequestRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await createUpgradeRequestValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var companyId = currentUserContext.RequireCompanyId();
        var currentUserId = currentUserContext.RequireUserId();
        var createdRequest = await planUpgradeRequestService.CreateTenantRequestAsync(
            companyId,
            currentUserId,
            request,
            cancellationToken);

        return CreatedAtAction(nameof(GetMyLatestUpgradeRequest), createdRequest);
    }

    [HttpGet("upgrade-requests/my-latest")]
    public async Task<ActionResult<PlanUpgradeRequestResponse?>> GetMyLatestUpgradeRequest(
        CancellationToken cancellationToken)
    {
        var companyId = currentUserContext.RequireCompanyId();

        return Ok(await planUpgradeRequestService.GetMyLatestAsync(companyId, cancellationToken));
    }
}
