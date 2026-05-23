import { api } from '../../lib/api'
import type { KardexEntry, KardexFilters, KardexListResponse } from '../../types/kardex'

export async function getKardexEntries(params: KardexFilters): Promise<KardexListResponse> {
  const response = await api.get<KardexListResponse>('/kardex', { params })

  return response.data
}

export async function getKardexEntryById(id: string): Promise<KardexEntry> {
  const response = await api.get<KardexEntry>(`/kardex/${id}`)

  return response.data
}

export async function getKardexByProduct(productId: string): Promise<KardexEntry[]> {
  const response = await api.get<KardexEntry[]>(`/kardex/by-product/${productId}`)

  return response.data
}

export async function getKardexByWarehouse(warehouseId: string): Promise<KardexEntry[]> {
  const response = await api.get<KardexEntry[]>(`/kardex/by-warehouse/${warehouseId}`)

  return response.data
}

export async function getKardexByProductAndWarehouse(productId: string, warehouseId: string): Promise<KardexEntry[]> {
  const response = await api.get<KardexEntry[]>(`/kardex/by-product/${productId}/warehouse/${warehouseId}`)

  return response.data
}
