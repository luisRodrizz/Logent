using InventorySaaS.Application.AuditLogs.DTOs;
using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/audit-logs")]
public class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var auditLogs = await auditLogService.GetAllAsync(cancellationToken);

        return Ok(auditLogs);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuditLogResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var auditLog = await auditLogService.GetByIdAsync(id, cancellationToken);

        return auditLog is null ? NotFound() : Ok(auditLog);
    }

    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>> GetByUser(
        string userId,
        CancellationToken cancellationToken)
    {
        var auditLogs = await auditLogService.GetByUserAsync(userId, cancellationToken);

        return Ok(auditLogs);
    }

    [HttpGet("by-entity/{entityName}")]
    public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>> GetByEntity(
        string entityName,
        CancellationToken cancellationToken)
    {
        var auditLogs = await auditLogService.GetByEntityAsync(entityName, cancellationToken);

        return Ok(auditLogs);
    }

    [HttpGet("by-action/{auditAction}")]
    public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>> GetByAction(
        string auditAction,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<AuditAction>(auditAction, ignoreCase: true, out var parsedAction)
            || !Enum.IsDefined(parsedAction))
        {
            return BadRequest("Invalid audit action.");
        }

        var auditLogs = await auditLogService.GetByActionAsync(parsedAction, cancellationToken);

        return Ok(auditLogs);
    }
}
