import { api } from '../../lib/api'
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  Warehouse,
  WarehouseFilters,
  WarehouseListResponse,
} from '../../types/warehouse'

export async function getWarehouses(params: WarehouseFilters): Promise<WarehouseListResponse> {
  const response = await api.get<WarehouseListResponse>('/warehouses', { params })

  return response.data
}

export async function getWarehouseById(id: string): Promise<Warehouse> {
  const response = await api.get<Warehouse>(`/warehouses/${id}`)

  return response.data
}

export async function createWarehouse(payload: CreateWarehouseRequest): Promise<Warehouse> {
  const response = await api.post<Warehouse>('/warehouses', payload)

  return response.data
}

export async function updateWarehouse(id: string, payload: UpdateWarehouseRequest): Promise<void> {
  await api.put(`/warehouses/${id}`, payload)
}

export async function deleteWarehouse(id: string): Promise<void> {
  await api.delete(`/warehouses/${id}`)
}
