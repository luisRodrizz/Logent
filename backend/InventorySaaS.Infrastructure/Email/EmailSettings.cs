namespace InventorySaaS.Infrastructure.Email;

public class EmailSettings
{
    public const string SectionName = "EmailSettings";

    public string Host { get; set; } = string.Empty;

    public int Port { get; set; } = 587;

    public string UserName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string FromEmail { get; set; } = "no-reply@logent.app";

    public string FromName { get; set; } = "LOGENT";

    public bool EnableSsl { get; set; } = true;
}
