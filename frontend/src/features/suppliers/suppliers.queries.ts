import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateSupplierRequest, SupplierFilters, UpdateSupplierRequest } from '../../types/supplier'
import { planQueryKeys } from '../plan/plan.queries'
import { createSupplier, deleteSupplier, getSupplierById, getSuppliers, updateSupplier } from './suppliers.api'

export const suppliersQueryKeys = {
  all: ['suppliers'] as const,
  detail: (id: string) => ['suppliers', id] as const,
  list: (params: SupplierFilters) => ['suppliers', params] as const,
}

export function useSuppliers(params: SupplierFilters) {
  return useQuery({
    queryFn: () => getSuppliers(params),
    queryKey: suppliersQueryKeys.list(params),
  })
}

export function useSupplier(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getSupplierById(id ?? ''),
    queryKey: id ? suppliersQueryKeys.detail(id) : ['suppliers', 'detail'],
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSupplierRequest) => createSupplier(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierRequest }) => updateSupplier(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all })
    },
  })
}
