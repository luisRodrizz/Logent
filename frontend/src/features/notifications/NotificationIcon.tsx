import { Bell, Check, CircleAlert, Info } from 'lucide-react'
import type { TenantNotificationSeverity } from './notifications.types'

export function NotificationIcon({ severity }: { severity: TenantNotificationSeverity }) {
  if (severity === 'Danger' || severity === 'Warning') {
    return <CircleAlert className="h-4 w-4" aria-hidden="true" />
  }

  if (severity === 'Success') {
    return <Check className="h-4 w-4" aria-hidden="true" />
  }

  if (severity === 'Info') {
    return <Info className="h-4 w-4" aria-hidden="true" />
  }

  return <Bell className="h-4 w-4" aria-hidden="true" />
}
