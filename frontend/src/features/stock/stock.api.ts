import { AxiosError } from 'axios'
import { api } from '../../lib/api'
import type { StockItem } from '../../types/stock'

export async function getStockItems(): Promise<StockItem[]> {
  const response = await api.get<StockItem[]>('/stock-items')

  return response.data
}

export async function getStockItemById(id: string): Promise<StockItem> {
  const response = await api.get<StockItem>(`/stock-items/${id}`)

  return response.data
}

export async function getStockItemsByProduct(productId: string): Promise<StockItem[]> {
  const response = await api.get<StockItem[]>(`/stock-items/by-product/${productId}`)

  return response.data
}

export async function getStockItemsByWarehouse(warehouseId: string): Promise<StockItem[]> {
  const response = await api.get<StockItem[]>(`/stock-items/by-warehouse/${warehouseId}`)

  return response.data
}

export async function getStockItemByProductAndWarehouse(
  productId: string,
  warehouseId: string,
): Promise<StockItem | null> {
  try {
    const response = await api.get<StockItem>(`/stock-items/by-product/${productId}/warehouse/${warehouseId}`)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null
    }

    throw error
  }
}
