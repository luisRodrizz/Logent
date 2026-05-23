import type { PaginatedResponse, PaginationParams } from './pagination'

export type Warehouse = {
  createdAt: string
  description?: string | null
  id: string
  isActive: boolean
  location?: string | null
  name: string
  updatedAt?: string | null
}

export type CreateWarehouseRequest = {
  description?: string | null
  location?: string | null
  name: string
}

export type UpdateWarehouseRequest = CreateWarehouseRequest

export type WarehouseFilters = PaginationParams

export type WarehouseListResponse = PaginatedResponse<Warehouse>
