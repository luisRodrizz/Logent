using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Infrastructure.Persistence;

public static class DemoTenantDefaults
{
    public static readonly Guid CompanyId = Guid.Parse("0f82ce70-7ee5-4f81-b190-0cc6e4148be4");

    public const string CompanyName = "LOGENT Demo";

    public const string CompanySlug = "logent-demo";

    public const string CompanyEmail = "admin@inventorysaas.com";

    public const PlanType CompanyPlan = PlanType.Pro;
}
