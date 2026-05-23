namespace InventorySaaS.Application.Common.DTOs;

public class ApiErrorResponse
{
    public int StatusCode { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? Detail { get; set; }

    public string TraceId { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }
}
