import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts } from '../products/products.api'
import { stockQueryKeys } from '../stock/stock.queries'
import { getStockItems } from '../stock/stock.api'
import { getWarehouses } from '../warehouses/warehouses.api'
import { planQueryKeys } from '../plan/plan.queries'
import type { CreateMovementRequest, MovementFilters } from '../../types/movement'
import { createMovement, getMovementById, getMovements } from './movements.api'

export const movementsQueryKeys = {
  all: ['movements'] as const,
  detail: (id?: string) => ['movements', id] as const,
  list: (params: MovementFilters) => ['movements', params] as const,
  productOptions: ['movements', 'product-options'] as const,
  stockAvailability: ['movements', 'stock-availability'] as const,
  warehouseOptions: ['movements', 'warehouse-options'] as const,
}

export function useMovements(params: MovementFilters) {
  return useQuery({
    queryFn: () => getMovements(params),
    queryKey: movementsQueryKeys.list(params),
  })
}

export function useMovement(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getMovementById(id ?? ''),
    queryKey: movementsQueryKeys.detail(id),
  })
}

export function useMovementProductOptions() {
  return useQuery({
    queryFn: () => getProducts({ pageNumber: 1, pageSize: 100 }),
    queryKey: movementsQueryKeys.productOptions,
  })
}

export function useMovementWarehouseOptions() {
  return useQuery({
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
    queryKey: movementsQueryKeys.warehouseOptions,
  })
}

export function useMovementStockAvailability() {
  return useQuery({
    queryFn: getStockItems,
    queryKey: movementsQueryKeys.stockAvailability,
  })
}

export function useCreateMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMovementRequest) => createMovement(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: movementsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: stockQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: planQueryKeys.all }),
      ])
    },
  })
}
