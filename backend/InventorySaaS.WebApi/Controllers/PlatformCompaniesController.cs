using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Platform.Companies.DTOs;
using InventorySaaS.Application.Platform.Companies.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.SuperAdminRole)]
[Route("api/platform/companies")]
public class PlatformCompaniesController(
    IPlatformCompanyService platformCompanyService,
    IValidator<UpdateCompanyStatusRequest> updateStatusValidator,
    IValidator<UpdateCompanyPlanRequest> updatePlanValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<PlatformCompanyListItemResponse>>> GetAll(
        [FromQuery] PlatformCompanyQueryRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await platformCompanyService.GetAllAsync(request, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlatformCompanyDetailResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var company = await platformCompanyService.GetByIdAsync(id, cancellationToken);

        return company is null
            ? this.ApiNotFound("Company not found.", "No company was found with the provided id.")
            : Ok(company);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        UpdateCompanyStatusRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateStatusValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return this.ApiUnauthorized();
        }

        var updated = await platformCompanyService.UpdateStatusAsync(id, request, currentUserId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Company not found.", "No company was found with the provided id.");
    }

    [HttpPatch("{id:guid}/plan")]
    public async Task<IActionResult> UpdatePlan(
        Guid id,
        UpdateCompanyPlanRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updatePlanValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return this.ApiUnauthorized();
        }

        var updated = await platformCompanyService.UpdatePlanAsync(id, request, currentUserId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Company not found.", "No company was found with the provided id.");
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }
}
