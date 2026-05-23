# InventorySaaS

InventorySaaS es un sistema SaaS de gestion de inventario con control de stock, movimientos, Kardex, reportes, dashboard, autenticacion JWT, roles y auditoria.

El backend esta construido con Clean Architecture y ASP.NET Core Web API. El frontend esta previsto como una SPA en React + Vite.

## Stack Tecnico

### Backend

- .NET / ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- ASP.NET Core Identity
- JWT Bearer Authentication
- FluentValidation
- Swagger / OpenAPI
- Serilog

### Frontend previsto

- React + Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Recharts
- Lucide React
- Sonner

## Arquitectura

El backend sigue Clean Architecture para separar reglas de dominio, casos de uso, infraestructura y API.

- `InventorySaaS.Domain`: entidades, enums y clases base del dominio.
- `InventorySaaS.Application`: DTOs, contratos, validators y abstracciones de servicios.
- `InventorySaaS.Infrastructure`: EF Core, Identity, servicios de negocio, persistencia, auditoria y autenticacion.
- `InventorySaaS.WebApi`: controllers, middleware, Swagger, JWT, CORS y configuracion HTTP.

## Estructura General

```text
InventorySaaS/
├── backend/
│   ├── InventorySaaS.sln
│   ├── InventorySaaS.Domain/
│   ├── InventorySaaS.Application/
│   ├── InventorySaaS.Infrastructure/
│   └── InventorySaaS.WebApi/
├── frontend/
└── README.md
```

## Requisitos

- .NET SDK
- SQL Server o SQL Server Express
- Visual Studio 2022 o VS Code
- Herramienta `dotnet-ef`

Instalacion de `dotnet-ef` si hace falta:

```powershell
dotnet tool install --global dotnet-ef
```

## Configuracion de Base de Datos

Connection string de desarrollo esperada:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=InventorySaaSDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

La instancia local usada para desarrollo es `localhost\SQLEXPRESS` con autenticacion de Windows.

## Comandos Principales

Desde la carpeta `backend`:

```powershell
dotnet restore
dotnet build .\InventorySaaS.sln
dotnet ef database update --project .\InventorySaaS.Infrastructure --startup-project .\InventorySaaS.WebApi
dotnet run --project .\InventorySaaS.WebApi --urls http://localhost:5088
```

Swagger queda disponible en:

```text
http://localhost:5088/swagger
```

## Credenciales Iniciales

Usuario administrador de desarrollo:

```text
Email: admin@inventorysaas.com
Password: Admin123
```

Estas credenciales son solo para desarrollo y deben cambiarse antes de usar el sistema en produccion.

## Roles

- `Admin`: acceso completo a administracion y operaciones.
- `Almacenero`: acceso operativo a consultas y movimientos permitidos.
- `Consulta`: acceso de solo lectura a informacion autorizada.

## Modulos Implementados

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

## Flujo de Inventario

- `Entry`: aumenta stock en el almacen destino.
- `Exit`: disminuye stock en el almacen origen.
- `Transfer`: descuenta stock del almacen origen y suma stock en el almacen destino.
- Cada movimiento genera registros de Kardex automaticamente.
- El stock no se edita manualmente.
- Kardex es solo lectura.
- Reports y Dashboard son solo lectura.

## Endpoints Principales

### Auth

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Categories

```text
GET    /api/categories
GET    /api/categories/{id}
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

### Suppliers

```text
GET    /api/suppliers
GET    /api/suppliers/{id}
POST   /api/suppliers
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}
```

### Warehouses

```text
GET    /api/warehouses
GET    /api/warehouses/{id}
POST   /api/warehouses
PUT    /api/warehouses/{id}
DELETE /api/warehouses/{id}
```

### Products

```text
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

### StockItems

```text
GET /api/stock-items
GET /api/stock-items/{id}
GET /api/stock-items/by-product/{productId}
GET /api/stock-items/by-warehouse/{warehouseId}
GET /api/stock-items/by-product/{productId}/warehouse/{warehouseId}
```

### Movements

```text
GET  /api/movements
GET  /api/movements/{id}
POST /api/movements
```

### Kardex

```text
GET /api/kardex
GET /api/kardex/{id}
GET /api/kardex/by-product/{productId}
GET /api/kardex/by-warehouse/{warehouseId}
GET /api/kardex/by-product/{productId}/warehouse/{warehouseId}
```

### Reports

```text
GET /api/reports/stock-summary
GET /api/reports/low-stock
GET /api/reports/movements-summary
GET /api/reports/kardex-summary
```

### Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/stock-overview
GET /api/dashboard/recent-movements
GET /api/dashboard/low-stock-alerts
```

### AuditLogs

```text
GET /api/audit-logs
GET /api/audit-logs/{id}
GET /api/audit-logs/by-user/{userId}
GET /api/audit-logs/by-entity/{entityName}
GET /api/audit-logs/by-action/{action}
```

## Paginacion y Busqueda

Los listados principales aceptan:

```text
?pageNumber=1&pageSize=10&search=texto
```

Disponible en:

- `GET /api/categories`
- `GET /api/suppliers`
- `GET /api/warehouses`
- `GET /api/products`
- `GET /api/movements`
- `GET /api/kardex`
- `GET /api/audit-logs`

Respuesta paginada:

```json
{
  "items": [],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 0,
  "totalPages": 0,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

## Manejo de Errores

El backend usa un middleware global de excepciones con formato estandar:

```json
{
  "statusCode": 400,
  "message": "Mensaje claro",
  "detail": "...",
  "traceId": "...",
  "timestamp": "2026-05-23T00:00:00Z"
}
```

Campos:

- `statusCode`: codigo HTTP.
- `message`: mensaje claro para el cliente.
- `detail`: detalle tecnico en ambiente de desarrollo.
- `traceId`: identificador de trazabilidad de la solicitud.
- `timestamp`: fecha y hora UTC de la respuesta.

## Seguridad

- Autenticacion con JWT Bearer.
- Autorizacion por roles.
- Swagger soporta `Authorize` con Bearer token.
- CORS configurado para futuros clientes React locales.
- Las credenciales iniciales son de desarrollo y deben cambiarse en produccion.

## Auditoria

El sistema registra logs automaticos para:

- Create / Update / Delete de Categories.
- Create / Update / Delete de Suppliers.
- Create / Update / Delete de Warehouses.
- Create / Update / Delete de Products.
- Create de Movements.

Los Audit Logs son consultables solo por usuarios con rol `Admin`.

## Estado del Proyecto

Backend funcional completado para el alcance actual.

Frontend pendiente: SPA con React + Vite.
