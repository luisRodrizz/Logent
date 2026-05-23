import { api } from '../../lib/api'
import type {
  CreateSupplierRequest,
  Supplier,
  SupplierFilters,
  SupplierListResponse,
  UpdateSupplierRequest,
} from '../../types/supplier'

export async function getSuppliers(params: SupplierFilters): Promise<SupplierListResponse> {
  const response = await api.get<SupplierListResponse>('/suppliers', { params })

  return response.data
}

export async function getSupplierById(id: string): Promise<Supplier> {
  const response = await api.get<Supplier>(`/suppliers/${id}`)

  return response.data
}

export async function createSupplier(payload: CreateSupplierRequest): Promise<Supplier> {
  const response = await api.post<Supplier>('/suppliers', payload)

  return response.data
}

export async function updateSupplier(id: string, payload: UpdateSupplierRequest): Promise<void> {
  await api.put(`/suppliers/${id}`, payload)
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`)
}
