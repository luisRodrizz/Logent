import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseFilters } from '../../types/warehouse'
import { createWarehouse, deleteWarehouse, getWarehouseById, getWarehouses, updateWarehouse } from './warehouses.api'

export const warehousesQueryKeys = {
  all: ['warehouses'] as const,
  detail: (id: string) => ['warehouses', id] as const,
  list: (params: WarehouseFilters) => ['warehouses', params] as const,
}

export function useWarehouses(params: WarehouseFilters) {
  return useQuery({
    queryFn: () => getWarehouses(params),
    queryKey: warehousesQueryKeys.list(params),
  })
}

export function useWarehouse(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getWarehouseById(id ?? ''),
    queryKey: id ? warehousesQueryKeys.detail(id) : ['warehouses', 'detail'],
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWarehouseRequest) => createWarehouse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all })
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWarehouseRequest }) => updateWarehouse(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all })
    },
  })
}
