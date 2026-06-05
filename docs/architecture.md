# LOGENT Architecture

LOGENT es un sistema SaaS multiempresa de inventario construido como proyecto avanzado de portafolio. La arquitectura separa backend, frontend, base de datos e integraciones externas para simular un producto SaaS real en modo demo.

## Vista General

```text
Usuario
  │
  ▼
Frontend React/Vite en Vercel
  │
  ▼
Backend ASP.NET Core Web API en Render
  │
  ├── Azure SQL
  ├── Stripe Test
  ├── Cloudinary
  └── SMTP demo/controlado
```

## Backend

El backend sigue Clean Architecture:

```text
InventorySaaS.Domain
InventorySaaS.Application
InventorySaaS.Infrastructure
InventorySaaS.WebApi
```

### Domain

Contiene entidades y conceptos principales del sistema:

- Company.
- ApplicationUser.
- Category.
- Supplier.
- Warehouse.
- Product.
- StockItem.
- Movement.
- MovementDetail.
- KardexEntry.
- AuditLog.
- TenantNotification.

### Application

Define contratos, DTOs, validaciones y casos de uso. Mantiene la lógica de aplicación desacoplada de detalles externos.

### Infrastructure

Implementa persistencia, Identity, JWT, Stripe, Cloudinary, SMTP, auditoría, límites de plan, notificaciones y servicios de soporte.

### WebApi

Expone endpoints REST, autenticación, autorización, middlewares, CORS, rate limiting, security headers y health checks.

## Frontend

El frontend está organizado por features:

```text
frontend/src/
├── app
├── assets
├── components
├── features
├── lib
└── types
```

### Patrones Principales

- React Router para rutas públicas y privadas.
- TanStack Query para datos remotos.
- Axios para API REST.
- React Hook Form + Zod para formularios.
- Tailwind CSS para UI.
- Sonner para notificaciones.
- Lucide React para iconografía.

## Multiempresa

Cada empresa opera como tenant mediante `CompanyId`.

Reglas principales:

- Los usuarios pertenecen a una empresa.
- Los datos operativos se filtran por empresa.
- Un Admin tenant administra solo usuarios de su empresa.
- SuperAdmin opera la plataforma desde rutas separadas.
- Las operaciones por ID deben validar pertenencia al tenant.

## Seguridad

- JWT Bearer.
- ASP.NET Core Identity.
- Roles: SuperAdmin, Admin, Almacenero, Consulta.
- Confirmación de email.
- Recuperación de contraseña.
- Rate limiting en endpoints sensibles.
- CORS por ambiente.
- Security headers.
- Auditoría.
- Bloqueo por empresa suspendida.
- Enforcement de suscripción.
- Límites por plan.

## Inventario

El stock no se edita directamente. Se calcula y actualiza mediante movimientos:

- Entry: aumenta stock.
- Exit: reduce stock y valida disponibilidad.
- Transfer: descuenta origen y suma destino.

El Kardex se genera automáticamente desde movimientos y permanece como vista de solo lectura.

## Integraciones

### Stripe Test

Se usa para simular checkout, portal de cliente, webhooks y ciclo de vida de suscripción. No hay cobros reales.

### Cloudinary

Se usa para subir y mostrar logos de empresa.

### SMTP

Se usa para confirmación de email, recuperación de contraseña, invitaciones y notificaciones críticas.

### Azure SQL

Base de datos demo para despliegue público.

## Deploy Demo

- Vercel sirve el frontend.
- Render ejecuta la API en contenedor Docker.
- Azure SQL aloja la base de datos.
- Stripe permanece en test mode.

Más detalle en [deployment-demo.md](deployment-demo.md).
