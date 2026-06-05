# LOGENT Deployment Demo

LOGENT se mantiene como proyecto de portafolio/demo. Esta guía prepara un despliegue demostrativo con Vercel, Render y Azure SQL sin activar pagos reales, sin guardar secretos en el repositorio y sin convertir el sistema en un SaaS comercial productivo.

## Arquitectura Demo

- Frontend: Vercel Hobby.
- Backend: Render Free Web Service.
- Base de datos: Azure SQL free tier o instancia demo equivalente.
- Pagos: Stripe test mode.
- Archivos/logos: Cloudinary free/test.
- Email: SMTP demo/controlado.

No usar claves live de Stripe ni datos reales de clientes. Los cobros reales quedan fuera de esta etapa.

## Antes Del Deploy

- Confirmar que no existan secretos en archivos versionados.
- Configurar las variables sensibles en Render, Vercel, User Secrets o variables de entorno.
- Mantener Stripe en test mode con `pk_test_`, `sk_test_`, `whsec_` y `price_` de productos test.
- Verificar que `/health` responde localmente.
- Tener una cuenta Cloudinary de prueba o carpeta dedicada a demo.
- Tener SMTP demo/controlado disponible.

## Azure SQL

1. Crear una base Azure SQL en tier gratuito o de bajo costo apto para demo.
2. Crear o seleccionar un servidor SQL y una base para LOGENT.
3. Habilitar acceso de firewall para el entorno que ejecutará migraciones.
4. Si Render necesita conectarse directamente, permitir el origen correspondiente según la configuración disponible del servicio.
5. Copiar la cadena de conexión y guardarla como variable de entorno, nunca en el repositorio.

Variable recomendada:

```text
ConnectionStrings__DefaultConnection=Server=tcp:TU-SERVIDOR.database.windows.net,1433;Initial Catalog=TU-DB;Persist Security Info=False;User ID=TU-USUARIO;Password=TU-PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

Ejecutar migraciones contra Azure SQL desde un entorno seguro:

```powershell
dotnet ef database update --project backend/InventorySaaS.Infrastructure --startup-project backend/InventorySaaS.WebApi
```

Precaución: revisar límites, costos, firewall y reglas de seguridad antes de dejar la demo pública.

## Render Backend

Render puede construir la API usando Docker.

Configuración sugerida:

- Service type: Web Service.
- Runtime: Docker.
- Build context: raíz del repositorio.
- Dockerfile path: `backend/Dockerfile`.
- Health check path: `/health`.

El Dockerfile publica `InventorySaaS.WebApi` y arranca la API usando el puerto provisto por Render:

```text
dotnet InventorySaaS.WebApi.dll --urls http://0.0.0.0:${PORT:-8080}
```

Variables de entorno necesarias en Render:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=...
Jwt__Key=...
Jwt__Issuer=LOGENT
Jwt__Audience=LOGENTClient
Jwt__ExpiresInMinutes=60
Cors__AllowedOrigins__0=https://TU-FRONTEND.vercel.app
AppUrls__BackendBaseUrl=https://TU-BACKEND.onrender.com
AppUrls__FrontendBaseUrl=https://TU-FRONTEND.vercel.app
Stripe__PublishableKey=pk_test_...
Stripe__SecretKey=sk_test_...
Stripe__WebhookSecret=whsec_...
Stripe__StarterPriceId=price_...
Stripe__ProPriceId=price_...
Stripe__SuccessUrl=https://TU-FRONTEND.vercel.app/billing/success
Stripe__CancelUrl=https://TU-FRONTEND.vercel.app/billing/cancel
Cloudinary__CloudName=...
Cloudinary__ApiKey=...
Cloudinary__ApiSecret=...
EmailSettings__Host=...
EmailSettings__Port=587
EmailSettings__UserName=...
EmailSettings__Password=...
EmailSettings__FromEmail=no-reply@tu-demo.com
EmailSettings__FromName=LOGENT
EmailSettings__EnableSsl=true
```

Nota: el backend consume `AppUrls__FrontendBaseUrl`, no `Frontend__BaseUrl`.

## Vercel Frontend

1. Crear un proyecto Vercel apuntando al repositorio.
2. Configurar root directory: `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Configurar la variable:

```text
VITE_API_URL=https://TU-BACKEND.onrender.com/api
```

Después de obtener el dominio de Vercel, actualizar en Render:

```text
Cors__AllowedOrigins__0=https://TU-FRONTEND.vercel.app
AppUrls__FrontendBaseUrl=https://TU-FRONTEND.vercel.app
Stripe__SuccessUrl=https://TU-FRONTEND.vercel.app/billing/success
Stripe__CancelUrl=https://TU-FRONTEND.vercel.app/billing/cancel
```

## Stripe Test Mode

Stripe se mantiene en test mode.

1. Usar solo claves `pk_test_` y `sk_test_`.
2. Usar solo `price_` de productos test.
3. Configurar webhook test con la URL pública de Render:

```text
https://TU-BACKEND.onrender.com/api/billing/webhook
```

4. Guardar `whsec_` como `Stripe__WebhookSecret`.
5. Probar checkout con tarjeta test `4242 4242 4242 4242`.

No configurar `pk_live_`, `sk_live_`, webhooks live ni cobros reales en esta etapa.

## Cloudinary

Configurar una cuenta o carpeta de prueba.

Variables:

```text
Cloudinary__CloudName
Cloudinary__ApiKey
Cloudinary__ApiSecret
```

Probar subida de logo desde configuración de empresa después del deploy.

## SMTP Demo

Para demo pública, usar SMTP controlado. MailPit se mantiene para local.

Variables:

```text
EmailSettings__Host
EmailSettings__Port
EmailSettings__UserName
EmailSettings__Password
EmailSettings__FromEmail
EmailSettings__FromName
EmailSettings__EnableSsl
```

Verificar:

- confirmación de correo,
- recuperación de contraseña,
- invitaciones,
- notificaciones críticas.

## Checklist Antes De Publicar

- SQL Server/Azure SQL creado.
- Migraciones aplicadas.
- Variables Render configuradas.
- Variables Vercel configuradas.
- CORS apunta al dominio real de Vercel.
- `/health` responde en Render.
- Stripe test mode configurado.
- Webhook test de Stripe configurado.
- Cloudinary test configurado.
- SMTP demo configurado.
- No hay secretos en git.
- No hay claves Stripe live.

## Checklist Después Del Deploy

- Abrir landing en Vercel.
- Probar `/login`.
- Probar registro de empresa.
- Confirmar correo desde email demo.
- Iniciar sesión con la empresa creada.
- Verificar dashboard tenant.
- Probar Stripe test checkout.
- Confirmar webhook Stripe test.
- Abrir portal de Stripe test.
- Probar subida de logo Cloudinary.
- Probar límites por plan.
- Revisar notificaciones tenant.
- Revisar auditoría.

## Pruebas Mínimas

- `GET https://TU-BACKEND.onrender.com/health`
- Login con usuario demo o usuario creado.
- Registro de empresa.
- Confirmación de email.
- Stripe test checkout con tarjeta `4242`.
- Stripe test webhook.
- Stripe Customer Portal test.
- Cloudinary logo upload.
- Límites por plan.

## Riesgos Conocidos

- Render Free puede dormir por inactividad.
- La primera carga puede tardar por cold start.
- Azure SQL requiere cuidado con firewall, límites y costos.
- Stripe sigue test y no procesa cobros reales.
- No usar datos reales de empresas, clientes o pagos.
- La configuración productiva real requiere QA, monitoreo, backups, legales y seguridad adicional.

## Producción Real Futura

Checklist futuro, fuera del alcance de esta demo:

- Base de datos productiva con backups y monitoreo.
- Dominio real y certificados.
- SMTP transaccional real.
- Stripe live solo cuando el producto sea comercial.
- Webhook live separado.
- Términos legales, privacidad, facturación e impuestos.
- Observabilidad y alertas.
- Revisión completa de seguridad.
- QA funcional, carga y regresión.
- Política de soporte y operación.
