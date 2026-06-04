import { ArrowRight, Bell, BellRing, Check, CheckCheck } from 'lucide-react'
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
import { NotificationIcon } from './NotificationIcon'
import { getNotificationIconClassName } from './notification-presentation'
import {
  useMarkAllTenantNotificationsAsRead,
  useMarkTenantNotificationAsRead,
  useTenantNotifications,
} from './notifications.queries'
import type { TenantNotification, TenantNotificationSeverity, TenantNotificationType } from './notifications.types'

const typeLabels: Record<TenantNotificationType, string> = {
  BillingPaymentFailed: 'Pago fallido',
  BillingPaymentSucceeded: 'Pago exitoso',
  BillingSubscriptionCancelled: 'Suscripción cancelada',
  InvitationAccepted: 'Invitación aceptada',
  PasswordChanged: 'Seguridad de cuenta',
  PlanUpdatedByStripe: 'Plan actualizado',
  System: 'Sistema',
  UpgradeRequestApproved: 'Solicitud aprobada',
  UpgradeRequestCreated: 'Solicitud enviada',
  UpgradeRequestRejected: 'Solicitud rechazada',
}

const severityLabels: Record<TenantNotificationSeverity, string> = {
  Danger: 'Crítica',
  Info: 'Informativa',
  Success: 'Exitosa',
  Warning: 'Advertencia',
}

const severityBadgeVariants: Record<TenantNotificationSeverity, 'danger' | 'default' | 'success' | 'warning'> = {
  Danger: 'danger',
  Info: 'default',
  Success: 'success',
  Warning: 'warning',
}

export function TenantNotificationsPage() {
  const notificationsQuery = useTenantNotifications()
  const markAsReadMutation = useMarkTenantNotificationAsRead()
  const markAllAsReadMutation = useMarkAllTenantNotificationsAsRead()
  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const attentionCount = notifications.filter(
    (notification) => notification.severity === 'Danger' || notification.severity === 'Warning',
  ).length

  function markAsRead(notification: TenantNotification) {
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
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            onClick={markAllAsRead}
            variant="secondary"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Marcar todas como leídas
          </Button>
        }
        description="Avisos de tu empresa, facturación, plan y seguridad de cuenta."
        eyebrow="Cuenta"
        title="Notificaciones"
      />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumen de notificaciones">
        {[
          { icon: BellRing, label: 'No leídas', value: unreadCount },
          { icon: Bell, label: 'Total', value: notifications.length },
          { icon: CheckCheck, label: 'Requieren atención', value: attentionCount },
        ].map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1017D8]/10 bg-[#1017D8]/5 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(item.value)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {notificationsQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando notificaciones..." />
          </CardContent>
        </Card>
      ) : null}

      {notificationsQuery.isError ? (
        <SectionError text={getApiErrorMessage(notificationsQuery.error, 'No se pudo cargar el centro de notificaciones.')} />
      ) : null}

      {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
        <EmptyState
          description="Los avisos sobre tu plan, facturación y cuenta aparecerán aquí."
          icon={<Bell className="h-6 w-6" />}
          title="Todo está al día"
        />
      ) : null}

      {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length > 0 ? (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {notifications.map((notification) => (
            <article
              className={`flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start ${
                notification.isRead ? 'bg-white' : 'bg-[#1017D8]/[0.025]'
              }`}
              key={notification.id}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getNotificationIconClassName(notification.severity)}`}
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
      ) : null}
    </div>
  )
}
