using InventorySaaS.Application.Movements.DTOs;
using InventorySaaS.Application.Movements.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace InventorySaaS.Infrastructure.Persistence;

public static class DemoDataSeeder
{
    private const string AdminEmail = "admin@inventorysaas.com";

    public static async Task SeedAsync(IServiceProvider serviceProvider, CancellationToken cancellationToken = default)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var movementService = serviceProvider.GetRequiredService<IMovementService>();

        var adminUser = await userManager.FindByEmailAsync(AdminEmail)
            ?? throw new InvalidOperationException("Admin user must be seeded before demo data.");

        await EnsureCatalogAsync(context, cancellationToken);

        var products = await context.Products
            .Where(product => DemoProductCodes.Contains(product.Code))
            .ToDictionaryAsync(product => product.Code, cancellationToken);

        var warehouses = await context.Warehouses
            .Where(warehouse => DemoWarehouseNames.Contains(warehouse.Name))
            .ToDictionaryAsync(warehouse => warehouse.Name, cancellationToken);

        await EnsureMovementsAsync(context, movementService, products, warehouses, adminUser.Id, cancellationToken);
    }

    private static async Task EnsureCatalogAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var categories = await context.Categories
            .Where(category => DemoCategoryNames.Contains(category.Name))
            .ToDictionaryAsync(category => category.Name, cancellationToken);

        foreach (var item in Categories)
        {
            if (!categories.TryGetValue(item.Name, out var category))
            {
                category = new Category
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = now
                };

                context.Categories.Add(category);
                categories[item.Name] = category;
            }

            category.Name = item.Name;
            category.Description = item.Description;
            category.IsActive = true;
            category.UpdatedAt = now;
        }

        var suppliers = await context.Suppliers
            .Where(supplier => DemoSupplierRucs.Contains(supplier.Ruc!))
            .ToDictionaryAsync(supplier => supplier.Ruc!, cancellationToken);

        foreach (var item in Suppliers)
        {
            if (!suppliers.TryGetValue(item.Ruc, out var supplier))
            {
                supplier = new Supplier
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = now
                };

                context.Suppliers.Add(supplier);
                suppliers[item.Ruc] = supplier;
            }

            supplier.BusinessName = item.BusinessName;
            supplier.Ruc = item.Ruc;
            supplier.Phone = item.Phone;
            supplier.Email = item.Email;
            supplier.Address = item.Address;
            supplier.IsActive = true;
            supplier.UpdatedAt = now;
        }

        var warehouses = await context.Warehouses
            .Where(warehouse => DemoWarehouseNames.Contains(warehouse.Name))
            .ToDictionaryAsync(warehouse => warehouse.Name, cancellationToken);

        foreach (var item in Warehouses)
        {
            if (!warehouses.TryGetValue(item.Name, out var warehouse))
            {
                warehouse = new Warehouse
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = now
                };

                context.Warehouses.Add(warehouse);
                warehouses[item.Name] = warehouse;
            }

            warehouse.Name = item.Name;
            warehouse.Location = item.Location;
            warehouse.Description = item.Description;
            warehouse.IsActive = true;
            warehouse.UpdatedAt = now;
        }

        await context.SaveChangesAsync(cancellationToken);

        var categoriesByName = await context.Categories
            .Where(category => DemoCategoryNames.Contains(category.Name))
            .ToDictionaryAsync(category => category.Name, cancellationToken);

        var suppliersByName = await context.Suppliers
            .Where(supplier => DemoSupplierNames.Contains(supplier.BusinessName))
            .ToDictionaryAsync(supplier => supplier.BusinessName, cancellationToken);

        var products = await context.Products
            .Where(product => DemoProductCodes.Contains(product.Code))
            .ToDictionaryAsync(product => product.Code, cancellationToken);

        foreach (var item in Products)
        {
            if (!products.TryGetValue(item.Code, out var product))
            {
                product = new Product
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = now
                };

                context.Products.Add(product);
                products[item.Code] = product;
            }

            product.Code = item.Code;
            product.Name = item.Name;
            product.Description = item.Description;
            product.CategoryId = categoriesByName[item.CategoryName].Id;
            product.SupplierId = suppliersByName[item.SupplierName].Id;
            product.PurchasePrice = item.PurchasePrice;
            product.SalePrice = item.SalePrice;
            product.MinimumStock = item.MinimumStock;
            product.IsActive = true;
            product.UpdatedAt = now;
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureMovementsAsync(
        ApplicationDbContext context,
        IMovementService movementService,
        IReadOnlyDictionary<string, Product> products,
        IReadOnlyDictionary<string, Warehouse> warehouses,
        string userId,
        CancellationToken cancellationToken)
    {
        await EnsureMovementAsync(
            context,
            movementService,
            products,
            MovementType.Entry,
            originWarehouseId: null,
            destinationWarehouseId: warehouses["Almacén Central"].Id,
            observation: "Ingreso inicial de inventario para operación principal.",
            userId,
            cancellationToken,
            new("LAP-LEN-E14", 10, 2800m),
            new("LAP-HP-450G9", 8, 2600m),
            new("MON-DELL-24", 14, 620m),
            new("TEC-LOG-MX", 25, 280m),
            new("MOU-LOG-M720", 30, 95m),
            new("IMP-HP-LJPRO", 5, 780m),
            new("ROUTER-TPL-AX55", 7, 230m),
            new("DOCK-DELL-USBC", 4, 420m));

        await EnsureMovementAsync(
            context,
            movementService,
            products,
            MovementType.Entry,
            originWarehouseId: null,
            destinationWarehouseId: warehouses["Almacén Norte"].Id,
            observation: "Ingreso de inventario para atención regional norte.",
            userId,
            cancellationToken,
            new("MON-LG-27", 8, 540m),
            new("CAM-LOG-C920", 10, 210m),
            new("SWITCH-TPL-16P", 6, 310m),
            new("DOCK-DELL-USBC", 6, 420m));

        await EnsureMovementAsync(
            context,
            movementService,
            products,
            MovementType.Exit,
            originWarehouseId: warehouses["Almacén Central"].Id,
            destinationWarehouseId: null,
            observation: "Salida de equipos para implementación interna.",
            userId,
            cancellationToken,
            new("LAP-LEN-E14", 2, 2800m),
            new("MON-DELL-24", 3, 620m),
            new("MOU-LOG-M720", 5, 95m));

        await EnsureMovementAsync(
            context,
            movementService,
            products,
            MovementType.Transfer,
            originWarehouseId: warehouses["Almacén Central"].Id,
            destinationWarehouseId: warehouses["Almacén Norte"].Id,
            observation: "Transferencia de periféricos para abastecimiento regional.",
            userId,
            cancellationToken,
            new("TEC-LOG-MX", 5, 280m),
            new("MOU-LOG-M720", 5, 95m),
            new("ROUTER-TPL-AX55", 2, 230m));

        await EnsureMovementAsync(
            context,
            movementService,
            products,
            MovementType.Transfer,
            originWarehouseId: warehouses["Almacén Central"].Id,
            destinationWarehouseId: warehouses["Almacén de Oficina"].Id,
            observation: "Distribución de equipos para áreas administrativas.",
            userId,
            cancellationToken,
            new("LAP-HP-450G9", 2, 2600m),
            new("MON-DELL-24", 2, 620m),
            new("DOCK-DELL-USBC", 2, 420m));

        await EnsureMovementAsync(
            context,
            movementService,
            products,
            MovementType.Exit,
            originWarehouseId: warehouses["Almacén Norte"].Id,
            destinationWarehouseId: null,
            observation: "Salida por instalación en oficina regional.",
            userId,
            cancellationToken,
            new("MON-LG-27", 2, 540m),
            new("CAM-LOG-C920", 3, 210m));
    }

    private static async Task EnsureMovementAsync(
        ApplicationDbContext context,
        IMovementService movementService,
        IReadOnlyDictionary<string, Product> products,
        MovementType type,
        Guid? originWarehouseId,
        Guid? destinationWarehouseId,
        string observation,
        string userId,
        CancellationToken cancellationToken,
        params DemoMovementDetail[] details)
    {
        var alreadySeeded = await context.Movements
            .AsNoTracking()
            .AnyAsync(movement => movement.Observation == observation, cancellationToken);

        if (alreadySeeded)
        {
            return;
        }

        var request = new CreateMovementRequest
        {
            Type = type,
            WarehouseOriginId = originWarehouseId,
            WarehouseDestinationId = destinationWarehouseId,
            Observation = observation,
            Details = details
                .Select(detail => new MovementDetailRequest
                {
                    ProductId = products[detail.ProductCode].Id,
                    Quantity = detail.Quantity,
                    UnitCost = detail.UnitCost
                })
                .ToList()
        };

        await movementService.CreateAsync(request, userId, cancellationToken);
    }

    private static readonly DemoCategory[] Categories =
    [
        new(
            "Computadoras",
            "Equipos portátiles y de escritorio para uso administrativo y operativo."),
        new(
            "Monitores",
            "Pantallas profesionales para estaciones de trabajo y áreas operativas."),
        new(
            "Periféricos",
            "Dispositivos complementarios como teclados, mouse, cámaras y accesorios."),
        new(
            "Impresoras",
            "Equipos de impresión para oficinas, almacenes y áreas administrativas."),
        new(
            "Redes y conectividad",
            "Equipos de red, conectividad y comunicación interna.")
    ];

    private static readonly DemoSupplier[] Suppliers =
    [
        new(
            "TechSupply Perú SAC",
            "20604578123",
            "987654321",
            "ventas@techsupply.pe",
            "Av. Javier Prado Este 2450, San Borja"),
        new(
            "OfficePro Distribuciones",
            "20547896321",
            "945123678",
            "contacto@officepro.pe",
            "Av. Arequipa 1800, Lince"),
        new(
            "Andes Hardware Solutions",
            "20458963217",
            "936852741",
            "comercial@andeshardware.pe",
            "Av. La Marina 3200, San Miguel"),
        new(
            "Digital Store Mayorista",
            "20632147895",
            "912345678",
            "ventas@digitalstore.pe",
            "Jr. Paruro 980, Cercado de Lima"),
        new(
            "Global Print Perú",
            "20596321478",
            "998741236",
            "soporte@globalprint.pe",
            "Av. República de Panamá 4200, Surquillo")
    ];

    private static readonly DemoWarehouse[] Warehouses =
    [
        new(
            "Almacén Central",
            "Lima - Ate",
            "Sede principal para recepción y distribución de inventario."),
        new(
            "Almacén Norte",
            "Lima - Los Olivos",
            "Punto de almacenamiento para operaciones de la zona norte."),
        new(
            "Almacén Sur",
            "Lima - Villa El Salvador",
            "Punto de almacenamiento para operaciones de la zona sur."),
        new(
            "Almacén de Repuestos",
            "Lima - San Miguel",
            "Área destinada a componentes, periféricos y accesorios técnicos."),
        new(
            "Almacén de Oficina",
            "Lima - Miraflores",
            "Inventario destinado a áreas administrativas internas.")
    ];

    private static readonly DemoProduct[] Products =
    [
        new(
            "LAP-LEN-E14",
            "Laptop Lenovo ThinkPad E14",
            "Computadoras",
            "TechSupply Perú SAC",
            2800m,
            3499m,
            3,
            "Laptop empresarial para trabajo administrativo, ventas y gestión operativa."),
        new(
            "LAP-HP-450G9",
            "Laptop HP ProBook 450 G9",
            "Computadoras",
            "TechSupply Perú SAC",
            2600m,
            3299m,
            3,
            "Laptop corporativa para usuarios administrativos y equipos de soporte."),
        new(
            "MON-DELL-24",
            "Monitor Dell UltraSharp 24",
            "Monitores",
            "TechSupply Perú SAC",
            620m,
            849m,
            5,
            "Monitor profesional de 24 pulgadas para estaciones de trabajo."),
        new(
            "MON-LG-27",
            "Monitor LG Full HD 27",
            "Monitores",
            "Digital Store Mayorista",
            540m,
            749m,
            4,
            "Monitor de 27 pulgadas para oficinas y salas operativas."),
        new(
            "TEC-LOG-MX",
            "Teclado Logitech MX Keys",
            "Periféricos",
            "OfficePro Distribuciones",
            280m,
            399m,
            6,
            "Teclado inalámbrico premium para productividad empresarial."),
        new(
            "MOU-LOG-M720",
            "Mouse Logitech M720",
            "Periféricos",
            "OfficePro Distribuciones",
            95m,
            149m,
            8,
            "Mouse inalámbrico ergonómico para uso administrativo."),
        new(
            "CAM-LOG-C920",
            "Cámara Web Logitech C920",
            "Periféricos",
            "OfficePro Distribuciones",
            210m,
            329m,
            5,
            "Cámara web Full HD para reuniones virtuales y soporte remoto."),
        new(
            "IMP-HP-LJPRO",
            "Impresora HP LaserJet Pro",
            "Impresoras",
            "Global Print Perú",
            780m,
            1099m,
            2,
            "Impresora láser para oficinas administrativas y áreas operativas."),
        new(
            "IMP-EPSON-L3250",
            "Impresora Epson EcoTank L3250",
            "Impresoras",
            "Global Print Perú",
            650m,
            929m,
            2,
            "Impresora multifuncional para áreas administrativas."),
        new(
            "ROUTER-TPL-AX55",
            "Router TP-Link Archer AX55",
            "Redes y conectividad",
            "Digital Store Mayorista",
            230m,
            349m,
            4,
            "Router WiFi 6 para oficinas y almacenes."),
        new(
            "SWITCH-TPL-16P",
            "Switch TP-Link 16 Puertos",
            "Redes y conectividad",
            "Andes Hardware Solutions",
            310m,
            459m,
            3,
            "Switch de red para conexión de equipos internos."),
        new(
            "DOCK-DELL-USBC",
            "Docking Station USB-C Dell",
            "Periféricos",
            "Andes Hardware Solutions",
            420m,
            599m,
            4,
            "Estación de acoplamiento USB-C para laptops corporativas.")
    ];

    private static readonly string[] DemoCategoryNames = Categories.Select(category => category.Name).ToArray();

    private static readonly string[] DemoSupplierNames = Suppliers.Select(supplier => supplier.BusinessName).ToArray();

    private static readonly string[] DemoSupplierRucs = Suppliers.Select(supplier => supplier.Ruc).ToArray();

    private static readonly string[] DemoWarehouseNames = Warehouses.Select(warehouse => warehouse.Name).ToArray();

    private static readonly string[] DemoProductCodes = Products.Select(product => product.Code).ToArray();

    private sealed record DemoCategory(string Name, string Description);

    private sealed record DemoSupplier(string BusinessName, string Ruc, string Phone, string Email, string Address);

    private sealed record DemoWarehouse(string Name, string Location, string Description);

    private sealed record DemoProduct(
        string Code,
        string Name,
        string CategoryName,
        string SupplierName,
        decimal PurchasePrice,
        decimal SalePrice,
        int MinimumStock,
        string Description);

    private sealed record DemoMovementDetail(string ProductCode, int Quantity, decimal UnitCost);
}
