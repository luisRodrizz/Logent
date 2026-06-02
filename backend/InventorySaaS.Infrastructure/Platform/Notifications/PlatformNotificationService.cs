using InventorySaaS.Application.Platform.Notifications.DTOs;
using InventorySaaS.Application.Platform.Notifications.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Platform.Notifications;

public class PlatformNotificationService(ApplicationDbContext context)
    : IPlatformNotificationService, IPlatformNotificationWriter
{
    public async Task<PlatformNotificationListResponse> GetAllAsync(
        PlatformNotificationQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.PlatformNotifications.AsNoTracking();
        var search = Normalize(request.Search);

        if (search is not null)
        {
            query = query.Where(
                notification =>
                    notification.Title.ToLower().Contains(search)
                    || notification.Message.ToLower().Contains(search)
                    || (notification.Company != null && notification.Company.Name.ToLower().Contains(search)));
        }

        if (request.Type.HasValue)
        {
            query = query.Where(notification => notification.Type == request.Type.Value);
        }

        if (request.Severity.HasValue)
        {
            query = query.Where(notification => notification.Severity == request.Severity.Value);
        }

        if (request.IsRead.HasValue)
        {
            query = query.Where(notification => notification.IsRead == request.IsRead.Value);
        }

        if (request.DateFrom.HasValue)
        {
            query = query.Where(notification => notification.CreatedAt >= request.DateFrom.Value.Date);
        }

        if (request.DateTo.HasValue)
        {
            var exclusiveDateTo = request.DateTo.Value.Date.AddDays(1);

            query = query.Where(notification => notification.CreatedAt < exclusiveDateTo);
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var unreadItems = await query.CountAsync(notification => !notification.IsRead, cancellationToken);
        var attentionItems = await query.CountAsync(
            notification =>
                notification.Severity == PlatformNotificationSeverity.Warning
                || notification.Severity == PlatformNotificationSeverity.Danger,
            cancellationToken);
        var items = await query
            .OrderBy(notification => notification.IsRead)
            .ThenByDescending(notification => notification.CreatedAt)
            .ThenByDescending(notification => notification.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(notification => new PlatformNotificationItemResponse
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                Severity = notification.Severity,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt,
                CompanyId = notification.CompanyId,
                CompanyName = notification.Company == null ? null : notification.Company.Name,
                RelatedEntityName = notification.RelatedEntityName,
                RelatedEntityId = notification.RelatedEntityId,
                ActionUrl = notification.ActionUrl
            })
            .ToListAsync(cancellationToken);

        return new PlatformNotificationListResponse
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = totalItems == 0
                ? 0
                : (int)Math.Ceiling(totalItems / (double)request.PageSize),
            UnreadItems = unreadItems,
            AttentionItems = attentionItems
        };
    }

    public async Task<PlatformNotificationUnreadCountResponse> GetUnreadCountAsync(
        CancellationToken cancellationToken = default)
    {
        return new PlatformNotificationUnreadCountResponse
        {
            Count = await context.PlatformNotifications.CountAsync(notification => !notification.IsRead, cancellationToken)
        };
    }

    public async Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var notification = await context.PlatformNotifications
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
        var now = DateTime.UtcNow;

        await context.PlatformNotifications
            .Where(notification => !notification.IsRead)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(notification => notification.IsRead, true)
                    .SetProperty(notification => notification.ReadAt, now),
                cancellationToken);
    }

    public async Task WriteAsync(
        CreatePlatformNotificationRequest request,
        CancellationToken cancellationToken = default)
    {
        context.PlatformNotifications.Add(new PlatformNotification
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            Severity = request.Severity,
            CompanyId = request.CompanyId,
            RelatedEntityName = NormalizeOptional(request.RelatedEntityName),
            RelatedEntityId = NormalizeOptional(request.RelatedEntityId),
            ActionUrl = NormalizeOptional(request.ActionUrl),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync(cancellationToken);
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim().ToLower();
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
