# InventorySaaS Frontend

Base tecnica de la SPA privada de InventorySaaS.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod
- Recharts
- Lucide React
- Sonner

## Comandos

```powershell
npm install
npm run dev
npm run lint
npm run build
```

## Configuracion

Copia `.env.example` a `.env` si necesitas cambiar la URL del Web API:

```text
VITE_API_URL=http://localhost:5088/api
```

La Fase 19 deja configurados providers, router base, Tailwind CSS, helpers de auth y una instancia Axios preparada para Bearer JWT.
