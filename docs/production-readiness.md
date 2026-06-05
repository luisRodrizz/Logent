# LOGENT Production Readiness para demo/portfolio

LOGENT se mantiene en esta etapa como un proyecto de portafolio/demo. Este documento prepara el sistema para un despliegue demostrativo controlado y deja una lista separada para una producción comercial futura.

No usar claves reales ni activar cobros reales en esta etapa.

## Modo actual

- Modo objetivo: `Portfolio/Demo`.
- Pagos: Stripe en modo test.
- Email local/demo: MailPit o SMTP de pruebas.
- Base de datos: SQL Server local o instancia demo.
- Archivos/logos: Cloudinary en cuenta o carpeta de pruebas.
- Frontend: Vite usando `VITE_API_URL`.
- Backend: ASP.NET Core Web API con JWT, Identity, CORS configurado por ambiente y `/health`.

## Configuración requerida

### ConnectionStrings

Variable recomendada:

```text
ConnectionStrings__DefaultConnection
```

Ejemplo local:

```text
Server=localhost\SQLEXPRESS;Database=InventorySaaSDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Para demo remoto, usar una cadena de conexión segura desde variables de entorno o secrets del proveedor. No subir credenciales al repositorio.

### JWT

Variables recomendadas:

```text
Jwt__Issuer
Jwt__Audience
Jwt__Key
Jwt__ExpiresInMinutes
```

Notas:

- `Jwt__Key` debe configurarse con User Secrets o variables de entorno.
- No guardar la clave JWT en `appsettings.json`.
- Usar una clave larga y aleatoria.
- `ExpiresInMinutes` define la expiración del token.

### CORS

Variables recomendadas:

```text
Cors__AllowedOrigins__0
Cors__AllowedOrigins__1
```

Development permite `http://localhost:3000` y `http://localhost:5173`.

Production/demo debe usar dominios explícitos. No usar comodines.

### Stripe test mode

Variables recomendadas:

```text
Stripe__PublishableKey
Stripe__SecretKey
Stripe__WebhookSecret
Stripe__StarterPriceId
Stripe__ProPriceId
Stripe__SuccessUrl
Stripe__CancelUrl
```

Reglas para esta etapa:

- Usar solo `pk_test_`, `sk_test_`, `whsec_` y `price_` de productos test.
- No configurar claves `live`.
- No activar cobros reales.
- Usar Stripe CLI o webhook test para eventos locales/demo.
- No guardar claves Stripe en `appsettings.json`.

### Cloudinary demo/test

Variables recomendadas:

```text
Cloudinary__CloudName
Cloudinary__ApiKey
Cloudinary__ApiSecret
```

Usar cuenta o carpeta de pruebas para logos de empresa. No subir `ApiSecret` al repositorio.

### EmailSettings

Variables recomendadas:

```text
EmailSettings__Host
EmailSettings__Port
EmailSettings__UserName
EmailSettings__Password
EmailSettings__FromEmail
EmailSettings__FromName
EmailSettings__EnableSsl
```

Para local:

- MailPit: host `localhost`, puerto `1025`, SSL desactivado.

Para demo:

- SMTP de pruebas o sandbox.
- No usar correo comercial real sin políticas y monitoreo adecuados.

### AppUrls / Frontend

Variables recomendadas:

```text
AppUrls__BackendBaseUrl
AppUrls__FrontendBaseUrl
VITE_API_URL
```

Ejemplo local:

```text
AppUrls__BackendBaseUrl=http://localhost:5088
AppUrls__FrontendBaseUrl=http://localhost:5173
VITE_API_URL=http://localhost:5088/api
```

`VITE_API_URL` debe apuntar al backend publicado incluyendo `/api`.

## Health check

Endpoint:

```text
GET /health
```

Uso esperado:

- Verificar que la API responde.
- Integrarlo en el hosting demo si el proveedor permite health checks.

El health check actual es básico de API. La verificación profunda de SQL Server puede agregarse más adelante si el hosting/demo lo requiere.

## Swagger

- Disponible en Development.
- No se expone en Production por defecto.
- Si se requiere Swagger en demo remoto, habilitarlo explícitamente con una decisión de configuración y controles de acceso adecuados.

## Checklist de despliegue demo/portfolio

1. Configurar SQL Server local o base demo.
2. Ejecutar migraciones EF Core.
3. Configurar `Jwt__Key`, issuer, audience y expiración por User Secrets o variables de entorno.
4. Configurar `Cors__AllowedOrigins` con el dominio del frontend demo.
5. Configurar Stripe test mode con claves `pk_test_`, `sk_test_`, `whsec_` y precios test.
6. Configurar Stripe CLI o webhook test.
7. Configurar MailPit local o SMTP demo.
8. Configurar Cloudinary test.
9. Configurar `VITE_API_URL` en el frontend.
10. Verificar `GET /health`.
11. Probar login.
12. Probar registro de empresa.
13. Probar confirmación de email.
14. Probar Stripe test con tarjeta `4242 4242 4242 4242`.
15. Probar Stripe Customer Portal en modo test.
16. Revisar `git status` y confirmar que no haya secretos ni `.env` reales.

## Checklist futuro de producción real

1. Cambiar a base de datos productiva administrada.
2. Configurar dominio real y HTTPS.
3. Configurar SMTP transaccional real.
4. Pasar a Stripe live solo cuando el producto sea comercial.
5. Configurar webhook live.
6. Revisar términos legales, privacidad, facturación e impuestos.
7. Configurar backups y restauración.
8. Configurar monitoreo, trazas y alertas.
9. Revisar seguridad con QA completo.
10. Ejecutar pruebas funcionales, carga básica y regresión end-to-end.

## Advertencias

- No usar claves live en esta etapa.
- No guardar secretos en `appsettings.json`, `.env`, README o capturas.
- No subir archivos `.env` reales al repositorio.
- Este proyecto está preparado como demo/portfolio; no representa aún una operación comercial real.
