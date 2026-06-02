import {
  ArrowRight,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Info,
  RotateCcw,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime, formatNumber } from '../../lib/format'
import { usePlatformDashboardSummary } from './platform-dashboard.queries'
import {
  useMarkAllPlatformNotificationsAsRead,
  useMarkPlatformNotificationAsRead,
  usePlatformNotifications,
} from './platform-notifications.queries'
import {
  platformNotificationSeverities,
  platformNotificationTypes,
  type PlatformNotificationItem,
  type PlatformNotificationSeverity,
  type PlatformNotificationType,
} from './platform-notifications.types'

const PAGE_SIZE = 10

const typeLabels: Record<PlatformNotificationType, string> = {
  CompanyReactivated: 'Empresa reactivada',
  CompanyRegistered: 'Nueva empresa',
  CompanySuspended: 'Empresa suspendida',
  PlanChanged: 'Cambio de plan',
  System: 'Sistema',
  UpgradeRequestApproved: 'Solicitud aprobada',
  UpgradeRequestCreated: 'Solicitud recibida',
  UpgradeRequestRejected: 'Solicitud rechazada',
}

const severityLabels: Record<PlatformNotificationSeverity, string> = {
  Danger: 'Crítica',
  Info: 'Informativa',
  Success: 'Exitosa',
  Warning: 'Advertencia',
}

const severityBadgeVariants: Record<PlatformNotificationSeverity, 'danger' | 'default' | 'success' | 'warning'> = {
  Danger: 'danger',
  Info: 'default',
  Success: 'success',
  Warning: 'warning',
}

function NotificationIcon({ severity }: { severity: PlatformNotificationSeverity }) {
  if (severity === 'Danger' || severity === 'Warning') {
    return <CircleAlert className="h-5 w-5" aria-hidden="true" />
  }

  if (severity === 'Success') {
    return <Check className="h-5 w-5" aria-hidden="true" />
  }

  return <Info className="h-5 w-5" aria-hidden="true" />
}

function getIconClassName(severity: PlatformNotificationSeverity) {
  if (severity === 'Danger') {
    return 'border-red-100 bg-red-50 text-red-600'
  }

  if (severity === 'Warning') {
    return 'border-amber-100 bg-amber-50 text-amber-700'
  }

  if (severity === 'Success') {
    return 'border-[#28E000]/20 bg-[#28E000]/10 text-emerald-700'
  }

  return 'border-[#1017D8]/10 bg-[#1017D8]/5 text-primary'
}

export function PlatformNotificationsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isRead, setIsRead] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [type, setType] = useState('')
  const notificationsQuery = usePlatformNotifications({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    isRead: isRead === '' ? undefined : isRead === 'true',
    page,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
    severity: (severity || undefined) as PlatformNotificationSeverity | undefined,
    type: (type || undefined) as PlatformNotificationType | undefined,
  })
  const dashboardSummaryQuery = usePlatformDashboardSummary()
  const markAsReadMutation = useMarkPlatformNotificationAsRead()
  const markAllAsReadMutation = useMarkAllPlatformNotificationsAsRead()
  const notifications = notificationsQuery.data?.items ?? []
  const hasFilters = Boolean(dateFrom || dateTo || isRead || search || severity || type)
  const summaryCards = [
    { icon: BellRing, label: 'No leídas', value: notificationsQuery.data?.unreadItems ?? 0 },
    { icon: Bell, label: 'Total avisos', value: notificationsQuery.data?.totalItems ?? 0 },
    { icon: CircleAlert, label: 'Requieren atención', value: notificationsQuery.data?.attentionItems ?? 0 },
    { icon: CheckCheck, label: 'Solicitudes pendientes', value: dashboardSummaryQuery.data?.pendingUpgradeRequests ?? 0 },
  ]

  function resetPagination() {
    setPage(1)
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setIsRead('')
    setPage(1)
    setSearch('')
    setSeverity('')
    setType('')
  }

  function markAsRead(notification: PlatformNotificationItem) {
    markAsReadMutation.mutate(notification.id, {
      onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo marcar la notificación como leída.')),
      onSuccess: () => toast.success('Notificación marcada como leída.'),
    })
  }

  function markAllAsRead() {
    markAllAsReadMutation.mutate(undefined, {
      onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudieron actualizar las notificaciones.')),
      onSuccess: () => toast.success('Todas las notificaciones fueron marcadas como leídas.'),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button
            disabled={(notificationsQuery.data?.unreadItems ?? 0) === 0 || markAllAsReadMutation.isPending}
            onClick={markAllAsRead}
            variant="secondary"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Marcar todas como leídas
          </Button>
        }
        description="Avisos importantes y acciones pendientes de la plataforma."
        eyebrow="Plataforma"
        title="Notificaciones"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de notificaciones">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1017D8]/10 bg-[#1017D8]/5 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-muted">{card.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(card.value)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_190px_160px_150px_150px_auto]">
            <label className="relative block">
              <span className="sr-only">Buscar notificación</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setSearch(event.target.value)
                  resetPagination()
                }}
                placeholder="Buscar aviso o empresa"
                type="search"
                value={search}
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por estado</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setIsRead(event.target.value)
                  resetPagination()
                }}
                value={isRead}
              >
                <option value="">Todos los estados</option>
                <option value="false">No leídas</option>
                <option value="true">Leídas</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por tipo</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setType(event.target.value)
                  resetPagination()
                }}
                value={type}
              >
                <option value="">Todos los tipos</option>
                {platformNotificationTypes.map((notificationType) => (
                  <option key={notificationType} value={notificationType}>
                    {typeLabels[notificationType]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por severidad</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setSeverity(event.target.value)
                  resetPagination()
                }}
                value={severity}
              >
                <option value="">Toda severidad</option>
                {platformNotificationSeverities.map((notificationSeverity) => (
                  <option key={notificationSeverity} value={notificationSeverity}>
                    {severityLabels[notificationSeverity]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Fecha inicial</span>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setDateFrom(event.target.value)
                  resetPagination()
                }}
                title="Fecha inicial"
                type="date"
                value={dateFrom}
              />
            </label>

            <label>
              <span className="sr-only">Fecha final</span>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setDateTo(event.target.value)
                  resetPagination()
                }}
                title="Fecha final"
                type="date"
                value={dateTo}
              />
            </label>

            <Button disabled={!hasFilters} onClick={clearFilters} size="sm" variant="secondary">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          </div>

          {notificationsQuery.isLoading ? <LoadingState text="Cargando notificaciones..." /> : null}

          {notificationsQuery.isError ? (
            <SectionError
              text={getApiErrorMessage(notificationsQuery.error, 'No se pudo cargar el centro de notificaciones.')}
            />
          ) : null}

          {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
            <EmptyState
              description="No encontramos avisos que coincidan con los filtros actuales."
              icon={<Bell className="h-6 w-6" />}
              title="Sin notificaciones disponibles"
            />
          ) : null}

          {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length > 0 ? (
            <>
              <div className="divide-y divide-border rounded-lg border border-border bg-white">
                {notifications.map((notification) => (
                  <article
                    className={`flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start ${
                      notification.isRead ? 'bg-white' : 'bg-[#1017D8]/[0.025]'
                    }`}
                    key={notification.id}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getIconClassName(notification.severity)}`}
                    >
                      <NotificationIcon severity={notification.severity} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">{notification.title}</h2>
                        <Badge variant={severityBadgeVariants[notification.severity]}>
                          {severityLabels[notification.severity]}
                        </Badge>
                        <Badge variant={notification.isRead ? 'muted' : 'default'}>
                          {notification.isRead ? 'Leída' : 'No leída'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span>{formatDateTime(notification.createdAt)}</span>
                        <span>{typeLabels[notification.type]}</span>
                        {notification.companyName ? <span>{notification.companyName}</span> : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      {!notification.isRead ? (
                        <Button
                          disabled={markAsReadMutation.isPending}
                          onClick={() => markAsRead(notification)}
                          size="sm"
                          variant="secondary"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Marcar como leída
                        </Button>
                      ) : null}
                      {notification.actionUrl ? (
                        <Link
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white shadow-sm shadow-blue-950/10 transition-colors hover:bg-[#0E16B8]"
                          to={notification.actionUrl}
                        >
                          Ver
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  {formatNumber(notificationsQuery.data?.totalItems)} avisos · Página {notificationsQuery.data?.page ?? 1}{' '}
                  de {Math.max(notificationsQuery.data?.totalPages ?? 0, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={(notificationsQuery.data?.page ?? 1) <= 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    size="sm"
                    variant="secondary"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </Button>
                  <Button
                    disabled={(notificationsQuery.data?.page ?? 1) >= (notificationsQuery.data?.totalPages ?? 0)}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    size="sm"
                    variant="secondary"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
