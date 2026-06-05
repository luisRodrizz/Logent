# LOGENT Demo Guide

Esta guía resume cómo evaluar LOGENT como demo profesional de portafolio.

## URLs

- Frontend demo: https://logent.vercel.app
- Backend demo: https://logent-api.onrender.com
- Healthcheck: https://logent-api.onrender.com/health

## Antes De Probar

- LOGENT es una demo/portfolio project.
- No ingresar datos reales de empresas, pagos, clientes o inventario sensible.
- Stripe está en modo test.
- Las credenciales están disponibles bajo solicitud.
- La pantalla de login puede incluir acceso demo para evaluación rápida.

## Recorrido Sugerido

1. Abrir la landing pública.
2. Revisar la sección de planes.
3. Entrar al login.
4. Iniciar sesión con credenciales demo autorizadas.
5. Revisar el Dashboard.
6. Explorar datos maestros:
   - Categorías.
   - Proveedores.
   - Almacenes.
   - Productos.
7. Revisar operación:
   - Stock.
   - Movimientos.
   - Kardex.
8. Revisar análisis:
   - Reportes.
   - Auditoría.
9. Revisar administración:
   - Usuarios.
   - Invitaciones.
10. Revisar cuenta:
   - Configuración de empresa.
   - Plan y uso.
   - Notificaciones.
   - Perfil.

## Pruebas Funcionales Recomendadas

- Crear una categoría de prueba.
- Crear un producto de prueba.
- Registrar una entrada de inventario.
- Revisar que el stock aumente.
- Revisar Kardex.
- Revisar reportes.
- Revisar auditoría.
- Cambiar datos del perfil.
- Revisar notificaciones.

## Pruebas SaaS

- Registrar una empresa nueva.
- Confirmar email desde el correo de demo si el entorno lo permite.
- Iniciar sesión con la empresa creada.
- Revisar aislamiento de datos.
- Solicitar cambio de plan.
- Probar Stripe test checkout con tarjeta de prueba si el acceso está habilitado.

Tarjeta Stripe test:

```text
4242 4242 4242 4242
```

Usar cualquier fecha futura, CVC de prueba y código postal de prueba.

## Consideraciones

- Render Free puede dormir por inactividad, por lo que la primera carga del backend puede tardar.
- Azure SQL puede tener límites de tier demo.
- Stripe no procesa pagos reales.
- Cloudinary se usa para logos de empresa en ambiente demo/test.
- El objetivo es evaluar arquitectura, UX, reglas de negocio y flujo SaaS.
