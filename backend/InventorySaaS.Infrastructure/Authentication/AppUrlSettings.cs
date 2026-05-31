namespace InventorySaaS.Infrastructure.Authentication;

public class AppUrlSettings
{
    public const string SectionName = "AppUrls";

    public string BackendBaseUrl { get; set; } = string.Empty;
}
