using InventorySaaS.Application.Platform.Notifications.DTOs;
using InventorySaaS.Application.Platform.Notifications.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.SuperAdminRole)]
[Route("api/platform/notifications")]
public class PlatformNotificationsController(IPlatformNotificationService platformNotificationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PlatformNotificationListResponse>> GetAll(
        [FromQuery] PlatformNotificationQueryRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await platformNotificationService.GetAllAsync(request, cancellationToken));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<PlatformNotificationUnreadCountResponse>> GetUnreadCount(
        CancellationToken cancellationToken)
    {
        return Ok(await platformNotificationService.GetUnreadCountAsync(cancellationToken));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        return await platformNotificationService.MarkAsReadAsync(id, cancellationToken)
            ? NoContent()
            : this.ApiNotFound("Notification not found.", "No platform notification was found with the provided id.");
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        await platformNotificationService.MarkAllAsReadAsync(cancellationToken);

        return NoContent();
    }
}
