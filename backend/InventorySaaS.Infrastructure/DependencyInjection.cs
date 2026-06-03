using InventorySaaS.Application.AuditLogs.Interfaces;
using InventorySaaS.Application.Auth.Interfaces;
using InventorySaaS.Application.Categories.Interfaces;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Dashboard.Interfaces;
using InventorySaaS.Application.Kardex.Interfaces;
using InventorySaaS.Application.Movements.Interfaces;
using InventorySaaS.Application.PlanUpgradeRequests.Interfaces;
using InventorySaaS.Application.Platform.Activity.Interfaces;
using InventorySaaS.Application.Platform.Analytics.Interfaces;
using InventorySaaS.Application.Platform.Companies.Interfaces;
using InventorySaaS.Application.Platform.Dashboard.Interfaces;
using InventorySaaS.Application.Platform.Notifications.Interfaces;
using InventorySaaS.Application.Products.Interfaces;
using InventorySaaS.Application.Profile.Interfaces;
using InventorySaaS.Application.Reports.Interfaces;
using InventorySaaS.Application.StockItems.Interfaces;
using InventorySaaS.Application.Suppliers.Interfaces;
using InventorySaaS.Application.TenantCompanySettings.Interfaces;
using InventorySaaS.Application.Users.Interfaces;
using InventorySaaS.Application.Warehouses.Interfaces;
using InventorySaaS.Infrastructure.Authentication;
using InventorySaaS.Infrastructure.AuditLogs;
using InventorySaaS.Infrastructure.Categories;
using InventorySaaS.Infrastructure.Cloudinary;
using InventorySaaS.Infrastructure.Dashboard;
using InventorySaaS.Infrastructure.Email;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Kardex;
using InventorySaaS.Infrastructure.Movements;
using InventorySaaS.Infrastructure.PlanUpgradeRequests;
using InventorySaaS.Infrastructure.Platform.Activity;
using InventorySaaS.Infrastructure.Platform.Analytics;
using InventorySaaS.Infrastructure.Platform.Companies;
using InventorySaaS.Infrastructure.Platform.Dashboard;
using InventorySaaS.Infrastructure.Platform.Notifications;
using InventorySaaS.Infrastructure.Persistence;
using InventorySaaS.Infrastructure.PlanLimits;
using InventorySaaS.Infrastructure.Products;
using InventorySaaS.Infrastructure.Profile;
using InventorySaaS.Infrastructure.Reports;
using InventorySaaS.Infrastructure.StockItems;
using InventorySaaS.Infrastructure.Suppliers;
using InventorySaaS.Infrastructure.TenantCompanySettings;
using InventorySaaS.Infrastructure.Users;
using InventorySaaS.Infrastructure.Warehouses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InventorySaaS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
        });

        // Identity
        services
            .AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        // Application services / business services
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IStockItemService, StockItemService>();
        services.AddScoped<IMovementService, MovementService>();
        services.AddScoped<IKardexService, KardexService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<ITenantCompanySettingsService, TenantCompanySettingsService>();
        services.AddScoped<IPlatformActivityService, PlatformActivityService>();
        services.AddScoped<IPlatformAnalyticsService, PlatformAnalyticsService>();
        services.AddScoped<IPlatformCompanyService, PlatformCompanyService>();
        services.AddScoped<IPlatformDashboardService, PlatformDashboardService>();
        services.AddScoped<PlatformNotificationService>();
        services.AddScoped<IPlatformNotificationService>(
            serviceProvider => serviceProvider.GetRequiredService<PlatformNotificationService>());
        services.AddScoped<IPlatformNotificationWriter>(
            serviceProvider => serviceProvider.GetRequiredService<PlatformNotificationService>());
        services.AddScoped<IPlanLimitService, PlanLimitService>();
        services.AddScoped<IPlanUpgradeRequestService, PlanUpgradeRequestService>();
        services.AddHttpClient<IImageStorageService, CloudinaryImageService>();

        // Authentication / audit helpers
        services.AddScoped<ICompanyRegistrationService, CompanyRegistrationService>();
        services.AddScoped<IEmailConfirmationService, EmailConfirmationService>();
        services.AddScoped<IPasswordRecoveryService, PasswordRecoveryService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuditLogWriter, AuditLogWriter>();
        services.Configure<AppUrlSettings>(configuration.GetSection(AppUrlSettings.SectionName));
        services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));
        services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}
