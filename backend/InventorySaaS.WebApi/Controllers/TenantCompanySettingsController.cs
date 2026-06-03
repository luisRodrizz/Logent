using FluentValidation;
using InventorySaaS.Application.TenantCompanySettings.DTOs;
using InventorySaaS.Application.TenantCompanySettings.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Route("api/company/settings")]
public class TenantCompanySettingsController(
    ITenantCompanySettingsService tenantCompanySettingsService,
    IValidator<UpdateTenantCompanySettingsRequest> updateValidator) : ControllerBase
{
    private const string TenantRoles = IdentitySeeder.AdminRole
        + ","
        + IdentitySeeder.WarehouseRole
        + ","
        + IdentitySeeder.ReadOnlyRole;

    [Authorize(Roles = TenantRoles)]
    [HttpGet]
    public async Task<ActionResult<TenantCompanySettingsResponse>> GetCurrentCompany(
        CancellationToken cancellationToken)
    {
        return Ok(await tenantCompanySettingsService.GetCurrentCompanyAsync(cancellationToken));
    }

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpPut]
    public async Task<ActionResult<TenantCompanySettingsResponse>> UpdateCurrentCompany(
        UpdateTenantCompanySettingsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var company = await tenantCompanySettingsService.UpdateCurrentCompanyAsync(request, cancellationToken);

        return Ok(company);
    }
}
