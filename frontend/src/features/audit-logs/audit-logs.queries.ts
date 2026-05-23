import { useQuery } from '@tanstack/react-query'
import type { AuditAction, AuditLogFilters } from '../../types/audit-log'
import {
  getAuditLogById,
  getAuditLogs,
  getAuditLogsByAction,
  getAuditLogsByEntity,
  getAuditLogsByUser,
} from './audit-logs.api'

export function useAuditLogs(params: AuditLogFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getAuditLogs(params),
    queryKey: ['audit-logs', params],
  })
}

export function useAuditLog(id: string | null, enabled = Boolean(id)) {
  return useQuery({
    enabled,
    queryFn: () => getAuditLogById(id ?? ''),
    queryKey: ['audit-logs', id],
  })
}

export function useAuditLogsByUser(userId: string, enabled = Boolean(userId)) {
  return useQuery({
    enabled,
    queryFn: () => getAuditLogsByUser(userId),
    queryKey: ['audit-logs', 'by-user', userId],
  })
}

export function useAuditLogsByEntity(entityName: string, enabled = Boolean(entityName)) {
  return useQuery({
    enabled,
    queryFn: () => getAuditLogsByEntity(entityName),
    queryKey: ['audit-logs', 'by-entity', entityName],
  })
}

export function useAuditLogsByAction(action: AuditAction | '', enabled = Boolean(action)) {
  return useQuery({
    enabled,
    queryFn: () => getAuditLogsByAction(action as AuditAction),
    queryKey: ['audit-logs', 'by-action', action],
  })
}
