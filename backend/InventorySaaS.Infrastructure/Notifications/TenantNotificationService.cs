using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Notifications.DTOs;
using InventorySaaS.Application.Notifications.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Notifications;

public class TenantNotificationService(
    ApplicationDbContext context,
    ICurrentUserContext currentUserContext)
    : ITenantNotificationService, ITenantNotificationWriter
{
    public async Task<IReadOnlyList<TenantNotificationResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var (companyId, userId) = RequireTenantContext();

        return await VisibleNotifications(companyId, userId)
            .AsNoTracking()
            .OrderBy(notification => notification.IsRead)
            .ThenByDescending(notification => notification.CreatedAt)
            .ThenByDescending(notification => notification.Id)
            .Select(notification => new TenantNotificationResponse
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                Severity = notification.Severity,
                IsRead = notification.IsRead,
                ReadAt = notification.ReadAt,
                CreatedAt = notification.CreatedAt,
                ActionUrl = notification.ActionUrl
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<TenantNotificationUnreadCountResponse> GetUnreadCountAsync(
        CancellationToken cancellationToken = default)
    {
        var (companyId, userId) = RequireTenantContext();

        return new TenantNotificationUnreadCountResponse
        {
            Count = await VisibleNotifications(companyId, userId)
                .CountAsync(notification => !notification.IsRead, cancellationToken)
        };
    }

    public async Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var (companyId, userId) = RequireTenantContext();
        var notification = await VisibleNotifications(companyId, userId)
            .FirstOrDefaultAsync(notification => notification.Id == id, cancellationToken);

        if (notification is null)
        {
            return false;
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);
        }

        return true;
    }

    public async Task MarkAllAsReadAsync(CancellationToken cancellationToken = default)
    {
        var (companyId, userId) = RequireTenantContext();
        var now = DateTime.UtcNow;

        await VisibleNotifications(companyId, userId)
            .Where(notification => !notification.IsRead)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(notification => notification.IsRead, true)
                    .SetProperty(notification => notification.ReadAt, now),
                cancellationToken);
    }

    public async Task WriteAsync(
        CreateTenantNotificationRequest request,
        CancellationToken cancellationToken = default)
    {
        context.TenantNotifications.Add(new TenantNotification
        {
            Id = Guid.NewGuid(),
            CompanyId = request.CompanyId,
            UserId = NormalizeOptional(request.UserId),
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            Severity = request.Severity,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            ActionUrl = NormalizeOptional(request.ActionUrl)
        });

        await context.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<TenantNotification> VisibleNotifications(Guid companyId, string userId)
    {
        return context.TenantNotifications.Where(
            notification =>
                notification.CompanyId == companyId
                && (notification.UserId == null || notification.UserId == userId));
    }

    private (Guid CompanyId, string UserId) RequireTenantContext()
    {
        if (!currentUserContext.IsTenantUser)
        {
            throw new ApiException(
                403,
                "Tenant notifications are not available.",
                "This notification center is available only to authenticated tenant users.");
        }

        return (currentUserContext.RequireCompanyId(), currentUserContext.RequireUserId());
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
