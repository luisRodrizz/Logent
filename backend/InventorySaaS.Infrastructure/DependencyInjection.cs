using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Categories.Interfaces;
using InventorySaaS.Application.Suppliers.Interfaces;
using InventorySaaS.Application.Warehouses.Interfaces;
using InventorySaaS.Application.Products.Interfaces;
using InventorySaaS.Application.StockItems.Interfaces;
using InventorySaaS.Application.Movements.Interfaces;
using InventorySaaS.Infrastructure.Authentication;
using InventorySaaS.Infrastructure.Categories;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using InventorySaaS.Infrastructure.Products;
using InventorySaaS.Infrastructure.StockItems;
using InventorySaaS.Infrastructure.Movements;
using InventorySaaS.Infrastructure.Suppliers;
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
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
        });

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

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IStockItemService, StockItemService>();
        services.AddScoped<IMovementService, MovementService>();

        return services;
    }
}
