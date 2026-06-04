import type { TenantNotificationSeverity } from './notifications.types'

export function getNotificationIconClassName(severity: TenantNotificationSeverity) {
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
