import type { PaginationParams } from './pagination'

export type AuditAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Login'
  | 'Logout'
  | 'StockEntry'
  | 'StockExit'
  | 'StockAdjustment'
  | 'StockTransfer'

export type AuditLog = {
  action: AuditAction
  createdAt: string
  description?: string | null
  entityId?: string | null
  entityName: string
  id: string
  userId?: string | null
}

export type AuditLogFilters = PaginationParams

export type AuditLogSpecificFilter = 'action' | 'entity' | 'user'
