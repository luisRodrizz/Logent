using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.TenantCompanySettings.DTOs;
using InventorySaaS.Application.TenantCompanySettings.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.TenantCompanySettings;

public class TenantCompanySettingsService(
    ApplicationDbContext context,
    ICurrentUserContext currentUserContext,
    IAuditLogWriter auditLogWriter,
    IImageStorageService imageStorageService) : ITenantCompanySettingsService
{
    public async Task<TenantCompanySettingsResponse> GetCurrentCompanyAsync(
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var company = await context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken);

        if (company is null)
        {
            throw new ApiException(
                404,
                "Company not found.",
                "No company was found for the current user context.");
        }

        return MapToResponse(company);
    }

    public async Task<TenantCompanySettingsResponse> UpdateCurrentCompanyAsync(
        UpdateTenantCompanySettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var currentUserId = currentUserContext.RequireUserId();
        var company = await context.Companies
            .FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken);

        if (company is null)
        {
            throw new ApiException(
                404,
                "Company not found.",
                "No company was found for the current user context.");
        }

        if (!company.IsActive)
        {
            throw new ApiException(
                403,
                "Company access is suspended.",
                "The current company is not active.");
        }

        company.CommercialName = Normalize(request.CommercialName);
        company.Address = Normalize(request.Address);
        company.Phone = Normalize(request.Phone);
        company.ContactEmail = Normalize(request.ContactEmail);
        company.Website = Normalize(request.Website);
        company.LogoUrl = Normalize(request.LogoUrl);
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.CompanyProfileUpdated,
            "Company",
            company.Id.ToString(),
            $"Company profile updated: {company.Name}",
            cancellationToken,
            company.Id);

        return MapToResponse(company);
    }

    public async Task<TenantCompanySettingsResponse> UploadCurrentCompanyLogoAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var company = await GetCurrentCompanyForUpdateAsync(cancellationToken);
        var uploadResult = await imageStorageService.UploadCompanyLogoAsync(
            company.Id,
            fileStream,
            fileName,
            contentType,
            cancellationToken);

        company.LogoUrl = uploadResult.Url;
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await WriteCompanyProfileAuditAsync(company, "Company logo updated", cancellationToken);

        return MapToResponse(company);
    }

    public async Task<TenantCompanySettingsResponse> DeleteCurrentCompanyLogoAsync(
        CancellationToken cancellationToken = default)
    {
        var company = await GetCurrentCompanyForUpdateAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(company.LogoUrl))
        {
            await imageStorageService.DeleteCompanyLogoAsync(company.Id, cancellationToken);
        }

        company.LogoUrl = null;
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await WriteCompanyProfileAuditAsync(company, "Company logo removed", cancellationToken);

        return MapToResponse(company);
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private async Task<Company> GetCurrentCompanyForUpdateAsync(CancellationToken cancellationToken)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var company = await context.Companies
            .FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken);

        if (company is null)
        {
            throw new ApiException(
                404,
                "Company not found.",
                "No company was found for the current user context.");
        }

        if (!company.IsActive)
        {
            throw new ApiException(
                403,
                "Company access is suspended.",
                "The current company is not active.");
        }

        return company;
    }

    private Task WriteCompanyProfileAuditAsync(
        Company company,
        string actionDescription,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUserContext.RequireUserId();

        return auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.CompanyProfileUpdated,
            "Company",
            company.Id.ToString(),
            $"{actionDescription}: {company.Name}",
            cancellationToken,
            company.Id);
    }

    private static TenantCompanySettingsResponse MapToResponse(Company company)
    {
        return new TenantCompanySettingsResponse
        {
            Id = company.Id,
            Name = company.Name,
            CommercialName = company.CommercialName,
            Slug = company.Slug,
            Ruc = company.Ruc,
            Address = company.Address,
            Phone = company.Phone,
            ContactEmail = company.ContactEmail,
            Website = company.Website,
            LogoUrl = company.LogoUrl,
            Plan = company.Plan,
            IsActive = company.IsActive,
            CreatedAt = company.CreatedAt
        };
    }
}
