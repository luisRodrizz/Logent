# LOGENT / InventorySaaS

LOGENT es un sistema SaaS de gestión de inventario orientado al control operativo de stock, movimientos, Kardex, reportes y auditoría. El proyecto integra un backend con arquitectura limpia y una interfaz web moderna para administrar catálogos, existencias, trazabilidad y consultas analíticas en un entorno local/demo.

## Identidad del producto

LOGENT es la identidad visual y nombre comercial del sistema InventorySaaS, orientada a presentar el proyecto como una plataforma SaaS profesional para gestión de inventarios.

InventorySaaS se mantiene como nombre técnico del repositorio/proyecto y como referencia interna de arquitectura.

## Objetivo del proyecto

InventorySaaS fue desarrollado como un proyecto full-stack avanzado para portafolio. LOGENT representa la experiencia visible del producto, aplicando arquitectura limpia, autenticación con JWT, control de roles, reglas de inventario, trazabilidad mediante auditoría y una UI premium responsive con enfoque enterprise.

## Características principales

- Autenticación con JWT.
- Control de roles: Admin, Almacenero y Consulta.
- Dashboard operativo con métricas, stock overview, movimientos recientes y alertas.
- CRUD de categorías, proveedores, almacenes y productos.
- Stock por producto y almacén.
- Movimientos de inventario: entradas, salidas y transferencias.
- Kardex automático generado desde los movimientos.
- Reportes operativos de stock, stock bajo, movimientos y Kardex.
- Auditoría de acciones relevantes del sistema.
- Seed demo profesional con datos en español.
- Interfaz responsive, premium y orientada a operaciones reales.

## Reglas de negocio principales

- El stock no se edita manualmente.
- El stock cambia únicamente mediante movimientos.
- Una entrada aumenta el stock en el almacén destino.
- Una salida reduce el stock del almacén origen y valida disponibilidad.
- Una transferencia descuenta stock del almacén origen y suma stock al almacén destino.
- El Kardex se genera automáticamente desde los movimientos y es solo lectura.
- Los reportes son solo lectura.
- La auditoría es solo lectura y se genera automáticamente desde operaciones auditadas.

## Roles del sistema

- **Admin:** acceso completo a la administración y operación del sistema.
- **Almacenero:** acceso operativo a módulos permitidos para consulta y registro de movimientos.
- **Consulta:** acceso de lectura según los permisos configurados.

## Tecnologías utilizadas

### Backend

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- ASP.NET Core Identity
- JWT Bearer
- Clean Architecture

### Frontend

- React
- Vite
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

## Arquitectura del proyecto

El backend sigue una organización basada en Clean Architecture, separando dominio, casos de uso, infraestructura y capa HTTP.

```text
backend/
├── InventorySaaS.Domain
├── InventorySaaS.Application
├── InventorySaaS.Infrastructure
└── InventorySaaS.WebApi
```

El frontend usa una arquitectura modular por features, con componentes comunes, clientes de API, tipos compartidos y páginas especializadas por dominio.

```text
frontend/
└── src/
    ├── app
    ├── components
    ├── features
    ├── lib
    └── types
```

## Módulos principales

- **Dashboard:** resumen ejecutivo de inventario, alertas y actividad reciente.
- **Categorías:** administración de clasificaciones de productos.
- **Proveedores:** administración de proveedores y datos comerciales.
- **Almacenes:** administración de ubicaciones y sedes de inventario.
- **Productos:** catálogo maestro con precios, stock mínimo, categoría y proveedor.
- **Stock:** consulta solo lectura de existencias por producto y almacén.
- **Movimientos:** registro de entradas, salidas y transferencias de inventario.
- **Kardex:** historial solo lectura de movimientos, saldos y costos.
- **Reportes:** análisis operativo de stock, stock bajo, movimientos y Kardex.
- **Auditoría:** trazabilidad administrativa de operaciones registradas.

## Credenciales demo

```text
Email: admin@inventorysaas.com
Password: Admin123
```

Estas credenciales son solo para ambiente local/demo.

## Requisitos previos

- .NET SDK
- Node.js
- npm
- SQL Server o SQL Server Express
- Git

## Configuración backend

Desde la raíz del proyecto:

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project InventorySaaS.WebApi/InventorySaaS.WebApi.csproj --launch-profile http --urls http://localhost:5088
```

La API queda disponible en:

```text
http://localhost:5088
```

Swagger queda disponible en:

```text
http://localhost:5088/swagger
```

## Configuración frontend

Desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en:

```text
http://localhost:5173
```

## Seed demo profesional

El sistema incluye un `DemoDataSeeder` pensado para ambiente local/demo.

- Se ejecuta automáticamente en Development.
- Es idempotente.
- Evita duplicar datos demo.
- Crea categorías, proveedores, almacenes, productos y movimientos demo.
- El stock se genera mediante la lógica de movimientos.
- El Kardex se genera automáticamente desde los movimientos.

## Endpoints principales

### Auth

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/stock-overview
GET /api/dashboard/recent-movements
GET /api/dashboard/low-stock-alerts
```

### Catálogos

```text
/api/categories
/api/suppliers
/api/warehouses
/api/products
```

### Operación

```text
/api/stock-items
/api/movements
/api/kardex
```

### Reportes

```text
GET /api/reports/stock-summary
GET /api/reports/low-stock
GET /api/reports/movements-summary
GET /api/reports/kardex-summary
```

### Auditoría

```text
/api/audit-logs
```

## Capturas

Pendiente agregar imágenes:

- Dashboard
- Productos
- Stock
- Movimientos
- Kardex
- Reportes
- Auditoría

## Estado del proyecto

Proyecto funcional en ambiente local/demo.

Pendiente opcional:

- Deploy.
- Documentación Swagger ampliada si aplica.
- Exportación de reportes si se decide implementar en el futuro.

## Autor

Desarrollado por Luis.
