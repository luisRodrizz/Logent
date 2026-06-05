using InventorySaaS.Application.AuditLogs.DTOs;
using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Domain.Enums;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/audit-logs")]
public class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<AuditLogResponse>>> GetAll(
        [FromQuery] AuditLogFilterRequest request,
        CancellationToken cancellationToken)
    {
        var auditLogs = await auditLogService.GetAllAsync(request, cancellationToken);

        return Ok(auditLogs);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] AuditLogFilterRequest request,
        CancellationToken cancellationToken)
    {
        var csv = await auditLogService.ExportCsvAsync(request, cancellationToken);
        var fileName = $"audit-logs-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";

        return File(
            Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv)).ToArray(),
            "text/csv; charset=utf-8",
            fileName);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuditLogResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var auditLog = await auditLogService.GetByIdAsync(id, cancellationToken);

        return auditLog is null
            ? this.ApiNotFound("Audit log not found.", "No audit log was found with the provided id.")
            : Ok(auditLog);
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
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "Invalid audit action.",
                "The provided audit action is not valid.");
        }

        var auditLogs = await auditLogService.GetByActionAsync(parsedAction, cancellationToken);

        return Ok(auditLogs);
    }
}
