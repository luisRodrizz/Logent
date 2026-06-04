using InventorySaaS.Application.Notifications.DTOs;
using InventorySaaS.Application.Notifications.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController(ITenantNotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TenantNotificationResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        return Ok(await notificationService.GetAllAsync(cancellationToken));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<TenantNotificationUnreadCountResponse>> GetUnreadCount(
        CancellationToken cancellationToken)
    {
        return Ok(await notificationService.GetUnreadCountAsync(cancellationToken));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        return await notificationService.MarkAsReadAsync(id, cancellationToken)
            ? NoContent()
            : this.ApiNotFound("Notification not found.", "No tenant notification was found with the provided id.");
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        await notificationService.MarkAllAsReadAsync(cancellationToken);

        return NoContent();
    }
}
