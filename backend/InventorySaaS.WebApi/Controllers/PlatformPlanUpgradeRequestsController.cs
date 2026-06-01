using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.PlanUpgradeRequests.DTOs;
using InventorySaaS.Application.PlanUpgradeRequests.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.SuperAdminRole)]
[Route("api/platform/plan-upgrade-requests")]
public class PlatformPlanUpgradeRequestsController(
    ICurrentUserContext currentUserContext,
    IPlanUpgradeRequestService planUpgradeRequestService,
    IValidator<ResolvePlanUpgradeRequestRequest> resolveRequestValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<PlatformPlanUpgradeRequestListItemResponse>>> GetAll(
        [FromQuery] PlatformPlanUpgradeRequestQueryRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await planUpgradeRequestService.GetPlatformRequestsAsync(request, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlatformPlanUpgradeRequestDetailResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var request = await planUpgradeRequestService.GetPlatformDetailAsync(id, cancellationToken);

        return request is null
            ? this.ApiNotFound("Plan upgrade request not found.", "No plan upgrade request was found with the provided id.")
            : Ok(request);
    }

    [HttpPatch("{id:guid}/approve")]
    public Task<IActionResult> Approve(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        CancellationToken cancellationToken)
    {
        return Resolve(id, request, approve: true, cancellationToken);
    }

    [HttpPatch("{id:guid}/reject")]
    public Task<IActionResult> Reject(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        CancellationToken cancellationToken)
    {
        return Resolve(id, request, approve: false, cancellationToken);
    }

    private async Task<IActionResult> Resolve(
        Guid id,
        ResolvePlanUpgradeRequestRequest request,
        bool approve,
        CancellationToken cancellationToken)
    {
        var validationResult = await resolveRequestValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = currentUserContext.RequireUserId();
        var updated = approve
            ? await planUpgradeRequestService.ApproveAsync(id, request, currentUserId, cancellationToken)
            : await planUpgradeRequestService.RejectAsync(id, request, currentUserId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Plan upgrade request not found.", "No plan upgrade request was found with the provided id.");
    }
}
