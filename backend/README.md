# InventorySaaS Backend

Documentacion tecnica del backend de InventorySaaS.

## Resumen

El backend implementa una API REST para gestion de inventario con autenticacion JWT, roles, operaciones de stock, Kardex automatico, reportes, dashboard, auditoria, paginacion, busqueda y manejo global de errores.

## Arquitectura de Proyectos

```text
backend/
├── InventorySaaS.sln
├── InventorySaaS.Domain/
├── InventorySaaS.Application/
├── InventorySaaS.Infrastructure/
└── InventorySaaS.WebApi/
```

### InventorySaaS.Domain

Contiene entidades, enums y clases base del dominio:

- Product
- Category
- Supplier
- Warehouse
- StockItem
- Movement
- MovementDetail
- KardexEntry
- AuditLog

### InventorySaaS.Application

Contiene contratos y modelos de aplicacion:

- DTOs
- Interfaces de servicios
- Validators con FluentValidation
- Respuestas comunes como `PagedResponse<T>` y `ApiErrorResponse`

### InventorySaaS.Infrastructure

Contiene implementaciones tecnicas:

- `ApplicationDbContext`
- Configuraciones Fluent API
- Servicios de negocio
- ASP.NET Core Identity
- Generacion de JWT
- Audit logging
- Acceso a SQL Server con EF Core

### InventorySaaS.WebApi

Contiene la capa HTTP:

- Controllers
- Middleware global de excepciones
- Configuracion de Swagger
- Configuracion JWT
- Configuracion CORS
- Ejecucion de `IdentitySeeder`

## Requisitos

- .NET SDK
- SQL Server o SQL Server Express
- `dotnet-ef`
- Visual Studio 2022 o VS Code

## Configuracion

Connection string de desarrollo en `InventorySaaS.WebApi/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=InventorySaaSDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Configuracion JWT de desarrollo:

```json
"Jwt": {
  "Issuer": "InventorySaaS",
  "Audience": "InventorySaaSClient",
  "Key": "THIS_IS_A_DEVELOPMENT_KEY_CHANGE_IT_FOR_PRODUCTION_123456789",
  "ExpiresInMinutes": 60
}
```

Cambiar secretos, passwords y credenciales antes de cualquier despliegue productivo.

## Comandos de Trabajo

Desde `backend`:

```powershell
dotnet restore
dotnet build .\InventorySaaS.sln
dotnet run --project .\InventorySaaS.WebApi --urls http://localhost:5088
```

## EF Core

Aplicar migraciones existentes:

```powershell
dotnet ef database update --project .\InventorySaaS.Infrastructure --startup-project .\InventorySaaS.WebApi
```

Crear una nueva migracion:

```powershell
dotnet ef migrations add NombreDeMigracion --project .\InventorySaaS.Infrastructure --startup-project .\InventorySaaS.WebApi --output-dir Persistence\Migrations
```

Actualizar base de datos:

```powershell
dotnet ef database update --project .\InventorySaaS.Infrastructure --startup-project .\InventorySaaS.WebApi
```

## Ejecutar API

```powershell
dotnet run --project .\InventorySaaS.WebApi --urls http://localhost:5088
```

Swagger:

```text
http://localhost:5088/swagger
```

## Usuario Inicial

El seed de Identity crea un usuario administrador para desarrollo:

```text
Email: admin@inventorysaas.com
Password: Admin123
Role: Admin
```

Estas credenciales deben cambiarse en produccion.

## Roles

- `Admin`
- `Almacenero`
- `Consulta`

## Probar Swagger con JWT

1. Ejecutar la API.
2. Abrir `http://localhost:5088/swagger`.
3. Ejecutar `POST /api/auth/login`.
4. Copiar el token JWT.
5. Presionar `Authorize`.
6. Ingresar el token como Bearer token.
7. Probar endpoints protegidos.

## Flujo de Inventario

Los movimientos son la unica forma de modificar stock:

- `Entry`: crea o aumenta stock en el almacen destino.
- `Exit`: valida stock suficiente y descuenta del almacen origen.
- `Transfer`: descuenta del almacen origen y suma al almacen destino.

Cada movimiento:

- Crea `Movement`.
- Crea `MovementDetail`.
- Actualiza `StockItem`.
- Genera `KardexEntry`.
- Registra `AuditLog`.

## Modulos

- Auth
- Categories
- Suppliers
- Warehouses
- Products
- StockItems
- Movements
- Kardex
- Reports
- Dashboard
- AuditLogs

## Paginacion

Los listados principales aceptan:

```text
pageNumber
pageSize
search
```

Ejemplo:

```text
GET /api/products?pageNumber=1&pageSize=10&search=laptop
```

Aplica a:

- Categories
- Suppliers
- Warehouses
- Products
- Movements
- Kardex
- AuditLogs

## Manejo Global de Errores

`ExceptionHandlingMiddleware` transforma errores conocidos en respuestas consistentes:

- `InvalidOperationException` -> 400
- `KeyNotFoundException` -> 404
- `UnauthorizedAccessException` -> 403
- Excepciones no controladas -> 500

Formato:

```json
{
  "statusCode": 400,
  "message": "Mensaje claro",
  "detail": "...",
  "traceId": "...",
  "timestamp": "2026-05-23T00:00:00Z"
}
```

## Auditoria

Se registran logs automaticos para:

- Categories: Create, Update, Delete
- Suppliers: Create, Update, Delete
- Warehouses: Create, Update, Delete
- Products: Create, Update, Delete
- Movements: Create

Los endpoints de AuditLogs son de solo lectura y requieren rol `Admin`.

## Notas de Desarrollo

- No editar stock manualmente.
- No crear Kardex manualmente.
- Reports y Dashboard son solo lectura.
- Mantener migraciones en `InventorySaaS.Infrastructure/Persistence/Migrations`.
- Mantener secretos reales fuera del repositorio en ambientes productivos.
