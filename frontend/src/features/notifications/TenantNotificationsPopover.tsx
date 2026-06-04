import { Bell, Check, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime } from '../../lib/format'
import { NotificationIcon } from './NotificationIcon'
import { getNotificationIconClassName } from './notification-presentation'
import {
  useMarkTenantNotificationAsRead,
  useTenantNotifications,
  useTenantNotificationUnreadCount,
} from './notifications.queries'
import type { TenantNotification } from './notifications.types'

export function TenantNotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const notificationsQuery = useTenantNotifications(isOpen)
  const unreadCountQuery = useTenantNotificationUnreadCount()
  const markAsReadMutation = useMarkTenantNotificationAsRead()
  const notifications = notificationsQuery.data?.slice(0, 5) ?? []
  const unreadCount = unreadCountQuery.data?.count ?? 0

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function markAsRead(notification: TenantNotification) {
    if (notification.isRead) {
      return
    }

    markAsReadMutation.mutate(notification.id, {
      onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo actualizar la notificación.')),
    })
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Abrir notificaciones"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-white shadow-xl shadow-slate-950/10">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notificaciones</p>
              <p className="mt-0.5 text-xs text-muted">{unreadCount} pendientes de lectura</p>
            </div>
            <Link
              className="text-xs font-semibold text-primary transition-colors hover:text-[#0E16B8]"
              onClick={() => setIsOpen(false)}
              to="/notifications"
            >
              Ver todas
            </Link>
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notificationsQuery.isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Cargando notificaciones...</p>
            ) : null}
            {notificationsQuery.isError ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">No se pudieron cargar las notificaciones.</p>
            ) : null}
            {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-foreground">Todo está al día</p>
                <p className="mt-1 text-xs text-muted">No tienes notificaciones disponibles.</p>
              </div>
            ) : null}
            {notifications.map((notification) => (
              <article
                className={`flex gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                  notification.isRead ? 'bg-white' : 'bg-[#1017D8]/[0.025]'
                }`}
                key={notification.id}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getNotificationIconClassName(notification.severity)}`}
                >
                  <NotificationIcon severity={notification.severity} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{notification.message}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400">{formatDateTime(notification.createdAt)}</p>
                </div>
                {!notification.isRead ? (
                  <Button
                    aria-label="Marcar notificación como leída"
                    className="h-8 w-8 shrink-0 p-0"
                    disabled={markAsReadMutation.isPending}
                    onClick={() => markAsRead(notification)}
                    size="sm"
                    title="Marcar como leída"
                    variant="ghost"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : null}
              </article>
            ))}
          </div>

          <Link
            className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-slate-50 hover:text-[#0E16B8]"
            onClick={() => setIsOpen(false)}
            to="/notifications"
          >
            Abrir centro de notificaciones
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  )
}
