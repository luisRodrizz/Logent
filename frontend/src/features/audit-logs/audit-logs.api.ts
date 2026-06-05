import { api } from '../../lib/api'
import type { AuditAction, AuditLog, AuditLogFilters } from '../../types/audit-log'
import type { PaginatedResponse } from '../../types/pagination'

export async function getAuditLogs(params: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
  const response = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', {
    params,
  })

  return response.data
}

export async function exportAuditLogsCsv(params: AuditLogFilters): Promise<Blob> {
  const response = await api.get<Blob>('/audit-logs/export', {
    params,
    responseType: 'blob',
  })

  return response.data
}

export async function getAuditLogById(id: string): Promise<AuditLog> {
  const response = await api.get<AuditLog>(`/audit-logs/${id}`)

  return response.data
}

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
  const response = await api.get<AuditLog[]>(`/audit-logs/by-user/${userId}`)

  return response.data
}

export async function getAuditLogsByEntity(entityName: string): Promise<AuditLog[]> {
  const response = await api.get<AuditLog[]>(`/audit-logs/by-entity/${entityName}`)

  return response.data
}

export async function getAuditLogsByAction(action: AuditAction): Promise<AuditLog[]> {
  const response = await api.get<AuditLog[]>(`/audit-logs/by-action/${action}`)

  return response.data
}
