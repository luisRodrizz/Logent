using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Platform.Companies.DTOs;
using InventorySaaS.Application.Platform.Companies.Interfaces;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Common.Extensions;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Platform.Companies;

public class PlatformCompanyService(
    ApplicationDbContext context,
    IAuditLogWriter auditLogWriter) : IPlatformCompanyService
{
    public async Task<PagedResponse<PlatformCompanyListItemResponse>> GetAllAsync(
        PlatformCompanyQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Companies.AsNoTracking();
        var search = request.NormalizeSearch();

        if (search is not null)
        {
            query = query.Where(
                company =>
                    company.Name.ToLower().Contains(search)
                    || company.Slug.ToLower().Contains(search)
                    || (company.Ruc != null && company.Ruc.ToLower().Contains(search))
                    || (company.Email != null && company.Email.ToLower().Contains(search)));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(company => company.IsActive == request.IsActive.Value);
        }

        if (request.Plan.HasValue)
        {
            query = query.Where(company => company.Plan == request.Plan.Value);
        }

        return await query
            .OrderBy(company => company.Name)
            .Select(
                company => new PlatformCompanyListItemResponse
                {
                    Id = company.Id,
                    Name = company.Name,
                    Slug = company.Slug,
                    Ruc = company.Ruc,
                    Email = company.Email,
                    Phone = company.Phone,
                    Plan = company.Plan,
                    IsActive = company.IsActive,
                    CreatedAt = company.CreatedAt,
                    UsersCount = context.Users.Count(user => user.CompanyId == company.Id),
                    ProductsCount = context.Products.Count(product => product.CompanyId == company.Id),
                    WarehousesCount = context.Warehouses.Count(warehouse => warehouse.CompanyId == company.Id)
                })
            .ToPagedResponseAsync(request, cancellationToken);
    }

    public async Task<PlatformCompanyDetailResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Companies
            .AsNoTracking()
            .Where(company => company.Id == id)
            .Select(
                company => new PlatformCompanyDetailResponse
                {
                    Id = company.Id,
                    Name = company.Name,
                    Slug = company.Slug,
                    Ruc = company.Ruc,
                    Email = company.Email,
                    Phone = company.Phone,
                    Address = company.Address,
                    Plan = company.Plan,
                    IsActive = company.IsActive,
                    CreatedAt = company.CreatedAt,
                    UpdatedAt = company.UpdatedAt,
                    UsersCount = context.Users.Count(user => user.CompanyId == company.Id),
                    ActiveUsersCount = context.Users.Count(user => user.CompanyId == company.Id && user.IsActive),
                    ProductsCount = context.Products.Count(product => product.CompanyId == company.Id),
                    WarehousesCount = context.Warehouses.Count(warehouse => warehouse.CompanyId == company.Id),
                    MovementsCount = context.Movements.Count(movement => movement.CompanyId == company.Id),
                    StockItemsCount = context.StockItems.Count(stockItem => stockItem.CompanyId == company.Id)
                })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> UpdateStatusAsync(
        Guid id,
        UpdateCompanyStatusRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies.FirstOrDefaultAsync(company => company.Id == id, cancellationToken);

        if (company is null)
        {
            return false;
        }

        company.IsActive = request.IsActive;
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.PlatformCompanyStatusChanged,
            "Company",
            company.Id.ToString(),
            $"Platform company status changed: {company.Name} active={request.IsActive}. Reason: {request.Reason ?? "Not provided"}",
            cancellationToken);

        return true;
    }

    public async Task<bool> UpdatePlanAsync(
        Guid id,
        UpdateCompanyPlanRequest request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies.FirstOrDefaultAsync(company => company.Id == id, cancellationToken);

        if (company is null)
        {
            return false;
        }

        company.Plan = Enum.Parse<PlanType>(request.Plan, ignoreCase: true);
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        await auditLogWriter.WriteAsync(
            currentUserId,
            AuditAction.PlatformCompanyPlanChanged,
            "Company",
            company.Id.ToString(),
            $"Platform company plan changed: {company.Name} plan={company.Plan}",
            cancellationToken);

        return true;
    }
}
