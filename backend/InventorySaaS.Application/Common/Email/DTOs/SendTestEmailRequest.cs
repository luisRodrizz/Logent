namespace InventorySaaS.Application.Common.Email.DTOs;

public class SendTestEmailRequest
{
    public string To { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
}
