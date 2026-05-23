import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { LoadingState } from '../components/common/LoadingState'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { routeRoles } from '../components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { RequireAuth } from '../features/auth/RequireAuth'
import { RequireRole } from '../features/auth/RequireRole'
import type { AuthRole } from '../types/auth'

const AuditLogsPage = lazy(() =>
  import('../features/audit-logs/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage })),
)
const CategoriesPage = lazy(() =>
  import('../features/categories/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const KardexPage = lazy(() =>
  import('../features/kardex/KardexPage').then((module) => ({ default: module.KardexPage })),
)
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const MovementsPage = lazy(() =>
  import('../features/movements/MovementsPage').then((module) => ({ default: module.MovementsPage })),
)
const ProductsPage = lazy(() =>
  import('../features/products/ProductsPage').then((module) => ({ default: module.ProductsPage })),
)
const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const StockPage = lazy(() => import('../features/stock/StockPage').then((module) => ({ default: module.StockPage })))
const SuppliersPage = lazy(() =>
  import('../features/suppliers/SuppliersPage').then((module) => ({ default: module.SuppliersPage })),
)
const WarehousesPage = lazy(() =>
  import('../features/warehouses/WarehousesPage').then((module) => ({ default: module.WarehousesPage })),
)

function FullPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <LoadingState text="Cargando InventorySaaS..." />
    </main>
  )
}

function RouteFallback() {
  return (
    <Card>
      <CardContent>
        <LoadingState text="Cargando modulo..." />
      </CardContent>
    </Card>
  )
}

function lazyRoute(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

function protectedRoute(element: ReactNode, allowedRoles: AuthRole[]) {
  return <RequireRole allowedRoles={allowedRoles}>{lazyRoute(element)}</RequireRole>
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>Pagina no encontrada</CardTitle>
          <CardDescription>La ruta solicitada no existe en el frontend.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            to="/dashboard"
          >
            Ir al dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route element={<RequireAuth />}>
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={protectedRoute(<DashboardPage />, routeRoles.dashboard)} />
            <Route path="/categories" element={protectedRoute(<CategoriesPage />, routeRoles.categories)} />
            <Route path="/suppliers" element={protectedRoute(<SuppliersPage />, routeRoles.suppliers)} />
            <Route path="/warehouses" element={protectedRoute(<WarehousesPage />, routeRoles.warehouses)} />
            <Route path="/products" element={protectedRoute(<ProductsPage />, routeRoles.products)} />
            <Route path="/stock" element={protectedRoute(<StockPage />, routeRoles.stock)} />
            <Route path="/movements" element={protectedRoute(<MovementsPage />, routeRoles.movements)} />
            <Route path="/kardex" element={protectedRoute(<KardexPage />, routeRoles.kardex)} />
            <Route path="/reports" element={protectedRoute(<ReportsPage />, routeRoles.reports)} />
            <Route path="/audit-logs" element={protectedRoute(<AuditLogsPage />, routeRoles.auditLogs)} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
