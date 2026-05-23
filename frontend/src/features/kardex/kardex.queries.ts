import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../products/products.api'
import { getWarehouses } from '../warehouses/warehouses.api'
import type { KardexFilters } from '../../types/kardex'
import {
  getKardexByProduct,
  getKardexByProductAndWarehouse,
  getKardexByWarehouse,
  getKardexEntries,
  getKardexEntryById,
} from './kardex.api'

export const kardexQueryKeys = {
  all: ['kardex'] as const,
  byProduct: (productId?: string) => ['kardex', 'by-product', productId] as const,
  byProductWarehouse: (productId?: string, warehouseId?: string) =>
    ['kardex', 'by-product-warehouse', productId, warehouseId] as const,
  byWarehouse: (warehouseId?: string) => ['kardex', 'by-warehouse', warehouseId] as const,
  detail: (id?: string) => ['kardex', id] as const,
  list: (params: KardexFilters) => ['kardex', params] as const,
  productOptions: ['kardex', 'product-options'] as const,
  warehouseOptions: ['kardex', 'warehouse-options'] as const,
}

export function useKardexEntries(params: KardexFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getKardexEntries(params),
    queryKey: kardexQueryKeys.list(params),
  })
}

export function useKardexEntry(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getKardexEntryById(id ?? ''),
    queryKey: kardexQueryKeys.detail(id),
  })
}

export function useKardexByProduct(productId?: string, enabled = Boolean(productId)) {
  return useQuery({
    enabled,
    queryFn: () => getKardexByProduct(productId ?? ''),
    queryKey: kardexQueryKeys.byProduct(productId),
  })
}

export function useKardexByWarehouse(warehouseId?: string, enabled = Boolean(warehouseId)) {
  return useQuery({
    enabled,
    queryFn: () => getKardexByWarehouse(warehouseId ?? ''),
    queryKey: kardexQueryKeys.byWarehouse(warehouseId),
  })
}

export function useKardexByProductAndWarehouse(
  productId?: string,
  warehouseId?: string,
  enabled = Boolean(productId && warehouseId),
) {
  return useQuery({
    enabled,
    queryFn: () => getKardexByProductAndWarehouse(productId ?? '', warehouseId ?? ''),
    queryKey: kardexQueryKeys.byProductWarehouse(productId, warehouseId),
  })
}

export function useKardexProductOptions() {
  return useQuery({
    queryFn: () => getProducts({ pageNumber: 1, pageSize: 100 }),
    queryKey: kardexQueryKeys.productOptions,
  })
}

export function useKardexWarehouseOptions() {
  return useQuery({
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
    queryKey: kardexQueryKeys.warehouseOptions,
  })
}
