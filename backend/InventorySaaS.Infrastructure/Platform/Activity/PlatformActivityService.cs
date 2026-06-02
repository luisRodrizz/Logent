using InventorySaaS.Application.Platform.Activity.DTOs;
using InventorySaaS.Application.Platform.Activity.Interfaces;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Platform.Activity;

public class PlatformActivityService(ApplicationDbContext context) : IPlatformActivityService
{
    public async Task<PlatformActivityListResponse> GetAllAsync(
        PlatformActivityQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.AuditLogs.AsNoTracking();
        var search = Normalize(request.Search);
        var entityName = Normalize(request.EntityName);

        if (search is not null)
        {
            query = query.Where(
                auditLog =>
                    auditLog.Description.ToLower().Contains(search)
                    || auditLog.EntityName.ToLower().Contains(search)
                    || (auditLog.EntityId != null && auditLog.EntityId.ToLower().Contains(search))
                    || (auditLog.UserId != null && auditLog.UserId.ToLower().Contains(search))
                    || (auditLog.Company != null && auditLog.Company.Name.ToLower().Contains(search))
                    || context.Users.Any(
                        user =>
                            user.Id == auditLog.UserId
                            && user.Email != null
                            && user.Email.ToLower().Contains(search)));
        }

        if (request.CompanyId.HasValue)
        {
            query = query.Where(auditLog => auditLog.CompanyId == request.CompanyId.Value);
        }

        if (request.Action.HasValue)
        {
            query = query.Where(auditLog => auditLog.Action == request.Action.Value);
        }

        if (request.DateFrom.HasValue)
        {
            query = query.Where(auditLog => auditLog.CreatedAt >= request.DateFrom.Value.Date);
        }

        if (request.DateTo.HasValue)
        {
            var exclusiveDateTo = request.DateTo.Value.Date.AddDays(1);

            query = query.Where(auditLog => auditLog.CreatedAt < exclusiveDateTo);
        }

        if (entityName is not null)
        {
            query = query.Where(auditLog => auditLog.EntityName.ToLower() == entityName);
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(auditLog => auditLog.CreatedAt)
            .ThenByDescending(auditLog => auditLog.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(
                auditLog => new PlatformActivityItemResponse
                {
                    Id = auditLog.Id,
                    CreatedAt = auditLog.CreatedAt,
                    CompanyId = auditLog.CompanyId,
                    CompanyName = auditLog.Company == null ? null : auditLog.Company.Name,
                    UserId = auditLog.UserId,
                    UserEmail = context.Users
                        .Where(user => user.Id == auditLog.UserId)
                        .Select(user => user.Email)
                        .FirstOrDefault(),
                    Action = auditLog.Action,
                    EntityName = auditLog.EntityName,
                    EntityId = auditLog.EntityId,
                    Description = auditLog.Description
                })
            .ToListAsync(cancellationToken);

        return new PlatformActivityListResponse
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = totalItems == 0
                ? 0
                : (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim().ToLower();
    }
}
