import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { AuditLogsPage } from '../features/audit-logs/AuditLogsPage'
import { LoginPage } from '../features/auth/LoginPage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { RequireRole } from '../features/auth/RequireRole'
import { CategoriesPage } from '../features/categories/CategoriesPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { KardexPage } from '../features/kardex/KardexPage'
import { MovementsPage } from '../features/movements/MovementsPage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { StockPage } from '../features/stock/StockPage'
import { SuppliersPage } from '../features/suppliers/SuppliersPage'
import { WarehousesPage } from '../features/warehouses/WarehousesPage'
import { routeRoles } from '../components/layout/navigation'

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
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate replace to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <RequireRole allowedRoles={routeRoles.dashboard}>
                  <DashboardPage />
                </RequireRole>
              }
            />
            <Route
              path="/categories"
              element={
                <RequireRole allowedRoles={routeRoles.categories}>
                  <CategoriesPage />
                </RequireRole>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RequireRole allowedRoles={routeRoles.suppliers}>
                  <SuppliersPage />
                </RequireRole>
              }
            />
            <Route
              path="/warehouses"
              element={
                <RequireRole allowedRoles={routeRoles.warehouses}>
                  <WarehousesPage />
                </RequireRole>
              }
            />
            <Route
              path="/products"
              element={
                <RequireRole allowedRoles={routeRoles.products}>
                  <ProductsPage />
                </RequireRole>
              }
            />
            <Route
              path="/stock"
              element={
                <RequireRole allowedRoles={routeRoles.stock}>
                  <StockPage />
                </RequireRole>
              }
            />
            <Route
              path="/movements"
              element={
                <RequireRole allowedRoles={routeRoles.movements}>
                  <MovementsPage />
                </RequireRole>
              }
            />
            <Route
              path="/kardex"
              element={
                <RequireRole allowedRoles={routeRoles.kardex}>
                  <KardexPage />
                </RequireRole>
              }
            />
            <Route
              path="/reports"
              element={
                <RequireRole allowedRoles={routeRoles.reports}>
                  <ReportsPage />
                </RequireRole>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <RequireRole allowedRoles={routeRoles.auditLogs}>
                  <AuditLogsPage />
                </RequireRole>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
