export type StockItem = {
  id: string
  productCode: string
  productId: string
  productName: string
  quantity: number
  updatedAt: string
  warehouseId: string
  warehouseName: string
}

export type StockFilters = {
  productId?: string
  warehouseId?: string
}
