import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { AuditLogsPage } from '../features/audit-logs/AuditLogsPage'
import { CategoriesPage } from '../features/categories/CategoriesPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { KardexPage } from '../features/kardex/KardexPage'
import { MovementsPage } from '../features/movements/MovementsPage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { StockPage } from '../features/stock/StockPage'
import { SuppliersPage } from '../features/suppliers/SuppliersPage'
import { WarehousesPage } from '../features/warehouses/WarehousesPage'

function LoginPlaceholderPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3">
            <Badge variant="default">Fase 20</Badge>
          </div>
          <CardTitle>InventorySaaS Login</CardTitle>
          <CardDescription>
            Placeholder publico para login. La autenticacion real y guards se implementaran en Fase 21.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            to="/dashboard"
          >
            Ver layout administrativo
          </Link>
        </CardContent>
      </Card>
    </main>
  )
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
        <Route path="/login" element={<LoginPlaceholderPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/kardex" element={<KardexPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
