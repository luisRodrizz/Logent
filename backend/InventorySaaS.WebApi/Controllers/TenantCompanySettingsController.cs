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
    private const long MaxLogoFileSize = 2 * 1024 * 1024;
    private const string TenantRoles = IdentitySeeder.AdminRole
        + ","
        + IdentitySeeder.WarehouseRole
        + ","
        + IdentitySeeder.ReadOnlyRole;
    private static readonly HashSet<string> AllowedLogoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

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

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpPost("logo")]
    public async Task<ActionResult<TenantCompanySettingsResponse>> UploadLogo(
        [FromForm] IFormFile? file,
        CancellationToken cancellationToken)
    {
        var errorResult = ValidateLogoFile(file);

        if (errorResult is not null)
        {
            return errorResult;
        }

        using var fileStream = file!.OpenReadStream();
        var company = await tenantCompanySettingsService.UploadCurrentCompanyLogoAsync(
            fileStream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        return Ok(company);
    }

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpDelete("logo")]
    public async Task<ActionResult<TenantCompanySettingsResponse>> DeleteLogo(CancellationToken cancellationToken)
    {
        var company = await tenantCompanySettingsService.DeleteCurrentCompanyLogoAsync(cancellationToken);

        return Ok(company);
    }

    private BadRequestObjectResult? ValidateLogoFile(IFormFile? file)
    {
        if (file is null || file.Length <= 0)
        {
            return ApiErrorResponseFactory.Validation(HttpContext, ["Logo file is required."]);
        }

        if (file.Length > MaxLogoFileSize)
        {
            return ApiErrorResponseFactory.Validation(HttpContext, ["Logo file must not exceed 2 MB."]);
        }

        if (!AllowedLogoContentTypes.Contains(file.ContentType))
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                ["Logo file must be JPG, PNG or WebP."]);
        }

        return null;
    }
}
