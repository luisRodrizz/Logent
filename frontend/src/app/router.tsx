import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoadingState } from '../components/common/LoadingState'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { routeRoles } from '../components/layout/navigation'
import { Card, CardContent } from '../components/ui/Card'
import { RequireAuth } from '../features/auth/RequireAuth'
import { RequireRole } from '../features/auth/RequireRole'
import type { AuthRole } from '../types/auth'

const AuditLogsPage = lazy(() =>
  import('../features/audit-logs/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage })),
)
const CategoriesPage = lazy(() =>
  import('../features/categories/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
)
const ConfirmEmailPage = lazy(() =>
  import('../features/auth/ConfirmEmailPage').then((module) => ({ default: module.ConfirmEmailPage })),
)
const TenantCompanySettingsPage = lazy(() =>
  import('../features/company-settings/TenantCompanySettingsPage').then((module) => ({
    default: module.TenantCompanySettingsPage,
  })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('../features/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })),
)
const KardexPage = lazy(() =>
  import('../features/kardex/KardexPage').then((module) => ({ default: module.KardexPage })),
)
const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterCompanyPage = lazy(() =>
  import('../features/auth/RegisterCompanyPage').then((module) => ({ default: module.RegisterCompanyPage })),
)
const MovementsPage = lazy(() =>
  import('../features/movements/MovementsPage').then((module) => ({ default: module.MovementsPage })),
)
const NotFoundPage = lazy(() =>
  import('../features/errors/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
const ProductsPage = lazy(() =>
  import('../features/products/ProductsPage').then((module) => ({ default: module.ProductsPage })),
)
const PlatformCompaniesPage = lazy(() =>
  import('../features/platform/PlatformCompaniesPage').then((module) => ({ default: module.PlatformCompaniesPage })),
)
const PlatformActivityPage = lazy(() =>
  import('../features/platform/PlatformActivityPage').then((module) => ({ default: module.PlatformActivityPage })),
)
const PlatformNotificationsPage = lazy(() =>
  import('../features/platform/PlatformNotificationsPage').then((module) => ({
    default: module.PlatformNotificationsPage,
  })),
)
const PlatformAnalyticsPage = lazy(() =>
  import('../features/platform/PlatformAnalyticsPage').then((module) => ({ default: module.PlatformAnalyticsPage })),
)
const PlatformDashboardPage = lazy(() =>
  import('../features/platform/PlatformDashboardPage').then((module) => ({ default: module.PlatformDashboardPage })),
)
const PlatformCompanyDetailPage = lazy(() =>
  import('../features/platform/PlatformCompanyDetailPage').then((module) => ({
    default: module.PlatformCompanyDetailPage,
  })),
)
const PlatformPlanUpgradeRequestDetailPage = lazy(() =>
  import('../features/platform/PlatformPlanUpgradeRequestDetailPage').then((module) => ({
    default: module.PlatformPlanUpgradeRequestDetailPage,
  })),
)
const PlatformPlanUpgradeRequestsPage = lazy(() =>
  import('../features/platform/PlatformPlanUpgradeRequestsPage').then((module) => ({
    default: module.PlatformPlanUpgradeRequestsPage,
  })),
)
const PlatformLayout = lazy(() =>
  import('../features/platform/PlatformLayout').then((module) => ({ default: module.PlatformLayout })),
)
const PlanPage = lazy(() => import('../features/plan/PlanPage').then((module) => ({ default: module.PlanPage })))
const ProfilePage = lazy(() =>
  import('../features/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const ResetPasswordPage = lazy(() =>
  import('../features/auth/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })),
)
const StockPage = lazy(() => import('../features/stock/StockPage').then((module) => ({ default: module.StockPage })))
const SuppliersPage = lazy(() =>
  import('../features/suppliers/SuppliersPage').then((module) => ({ default: module.SuppliersPage })),
)
const UsersPage = lazy(() =>
  import('../features/users/UsersPage').then((module) => ({ default: module.UsersPage })),
)
const UnauthorizedPage = lazy(() =>
  import('../features/errors/UnauthorizedPage').then((module) => ({ default: module.UnauthorizedPage })),
)
const WarehousesPage = lazy(() =>
  import('../features/warehouses/WarehousesPage').then((module) => ({ default: module.WarehousesPage })),
)

function FullPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <LoadingState text="Cargando LOGENT..." />
    </main>
  )
}

function RouteFallback() {
  return (
    <Card>
      <CardContent>
        <LoadingState text="Cargando módulo..." />
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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/confirm-email"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <ConfirmEmailPage />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/register-company"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <RegisterCompanyPage />
            </Suspense>
          }
        />
        <Route element={<RequireAuth />}>
          <Route
            path="/unauthorized"
            element={
              <Suspense fallback={<FullPageFallback />}>
                <UnauthorizedPage />
              </Suspense>
            }
          />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={protectedRoute(<DashboardPage />, routeRoles.dashboard)} />
            <Route path="/categories" element={protectedRoute(<CategoriesPage />, routeRoles.categories)} />
            <Route path="/suppliers" element={protectedRoute(<SuppliersPage />, routeRoles.suppliers)} />
            <Route path="/warehouses" element={protectedRoute(<WarehousesPage />, routeRoles.warehouses)} />
            <Route path="/products" element={protectedRoute(<ProductsPage />, routeRoles.products)} />
            <Route path="/stock" element={protectedRoute(<StockPage />, routeRoles.stock)} />
            <Route path="/movements" element={protectedRoute(<MovementsPage />, routeRoles.movements)} />
            <Route path="/kardex" element={protectedRoute(<KardexPage />, routeRoles.kardex)} />
            <Route path="/reports" element={protectedRoute(<ReportsPage />, routeRoles.reports)} />
            <Route
              path="/settings/company"
              element={protectedRoute(<TenantCompanySettingsPage />, routeRoles.companySettings)}
            />
            <Route path="/plan" element={protectedRoute(<PlanPage />, routeRoles.plan)} />
            <Route path="/profile" element={lazyRoute(<ProfilePage />)} />
            <Route path="/admin/users" element={protectedRoute(<UsersPage />, routeRoles.users)} />
            <Route path="/audit-logs" element={protectedRoute(<AuditLogsPage />, routeRoles.auditLogs)} />
          </Route>
          <Route path="/platform" element={protectedRoute(<PlatformLayout />, ['SuperAdmin'])}>
            <Route index element={lazyRoute(<PlatformDashboardPage />)} />
            <Route path="activity" element={lazyRoute(<PlatformActivityPage />)} />
            <Route path="analytics" element={lazyRoute(<PlatformAnalyticsPage />)} />
            <Route path="notifications" element={lazyRoute(<PlatformNotificationsPage />)} />
            <Route path="companies" element={lazyRoute(<PlatformCompaniesPage />)} />
            <Route path="companies/:id" element={lazyRoute(<PlatformCompanyDetailPage />)} />
            <Route path="upgrade-requests" element={lazyRoute(<PlatformPlanUpgradeRequestsPage />)} />
            <Route path="upgrade-requests/:id" element={lazyRoute(<PlatformPlanUpgradeRequestDetailPage />)} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
