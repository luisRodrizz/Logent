namespace InventorySaaS.Infrastructure.Billing;

public class StripeSettings
{
    public const string SectionName = "Stripe";

    public string PublishableKey { get; set; } = string.Empty;

    public string SecretKey { get; set; } = string.Empty;

    public string WebhookSecret { get; set; } = string.Empty;

    public string StarterPriceId { get; set; } = string.Empty;

    public string ProPriceId { get; set; } = string.Empty;

    public string SuccessUrl { get; set; } = string.Empty;

    public string CancelUrl { get; set; } = string.Empty;
}
