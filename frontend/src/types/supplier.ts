import type { PaginatedResponse, PaginationParams } from './pagination'

export type Supplier = {
  address?: string | null
  businessName: string
  createdAt: string
  email?: string | null
  id: string
  isActive: boolean
  phone?: string | null
  ruc?: string | null
  updatedAt?: string | null
}

export type CreateSupplierRequest = {
  address?: string | null
  businessName: string
  email?: string | null
  phone?: string | null
  ruc?: string | null
}

export type UpdateSupplierRequest = CreateSupplierRequest

export type SupplierFilters = PaginationParams

export type SupplierListResponse = PaginatedResponse<Supplier>
