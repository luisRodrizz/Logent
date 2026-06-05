using InventorySaaS.Application.Common.DTOs;

namespace InventorySaaS.Application.AuditLogs.DTOs;

public class AuditLogFilterRequest : PagedRequest
{
    public string? Action { get; set; }

    public string? UserId { get; set; }

    public string? EntityName { get; set; }

    public string? EntityId { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }
}
