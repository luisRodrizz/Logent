import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../products/products.api'
import { getWarehouses } from '../warehouses/warehouses.api'
import {
  getStockItemById,
  getStockItemByProductAndWarehouse,
  getStockItems,
  getStockItemsByProduct,
  getStockItemsByWarehouse,
} from './stock.api'

export const stockQueryKeys = {
  all: ['stock-items'] as const,
  byProduct: (productId?: string) => ['stock-items', 'by-product', productId] as const,
  byProductWarehouse: (productId?: string, warehouseId?: string) =>
    ['stock-items', 'by-product-warehouse', productId, warehouseId] as const,
  byWarehouse: (warehouseId?: string) => ['stock-items', 'by-warehouse', warehouseId] as const,
  detail: (id?: string) => ['stock-items', id] as const,
  productOptions: ['stock-items', 'product-options'] as const,
  warehouseOptions: ['stock-items', 'warehouse-options'] as const,
}

export function useStockItems(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getStockItems,
    queryKey: stockQueryKeys.all,
  })
}

export function useStockItem(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getStockItemById(id ?? ''),
    queryKey: stockQueryKeys.detail(id),
  })
}

export function useStockItemsByProduct(productId?: string, enabled = Boolean(productId)) {
  return useQuery({
    enabled,
    queryFn: () => getStockItemsByProduct(productId ?? ''),
    queryKey: stockQueryKeys.byProduct(productId),
  })
}

export function useStockItemsByWarehouse(warehouseId?: string, enabled = Boolean(warehouseId)) {
  return useQuery({
    enabled,
    queryFn: () => getStockItemsByWarehouse(warehouseId ?? ''),
    queryKey: stockQueryKeys.byWarehouse(warehouseId),
  })
}

export function useStockItemByProductAndWarehouse(
  productId?: string,
  warehouseId?: string,
  enabled = Boolean(productId && warehouseId),
) {
  return useQuery({
    enabled,
    queryFn: () => getStockItemByProductAndWarehouse(productId ?? '', warehouseId ?? ''),
    queryKey: stockQueryKeys.byProductWarehouse(productId, warehouseId),
  })
}

export function useStockProductOptions() {
  return useQuery({
    queryFn: () => getProducts({ pageNumber: 1, pageSize: 100 }),
    queryKey: stockQueryKeys.productOptions,
  })
}

export function useStockWarehouseOptions() {
  return useQuery({
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
    queryKey: stockQueryKeys.warehouseOptions,
  })
}
