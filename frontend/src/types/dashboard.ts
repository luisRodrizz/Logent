export type MovementType = 'Entry' | 'Exit' | 'Adjustment' | 'Transfer'

export type DashboardSummary = {
  lowStockItems: number
  totalCategories: number
  totalInventoryValue: number
  totalKardexEntries: number
  totalMovements: number
  totalProducts: number
  totalStockItems: number
  totalSuppliers: number
  totalWarehouses: number
}

export type StockOverviewItem = {
  estimatedValue: number
  isLowStock: boolean
  minimumStock: number
  productCode: string
  productId: string
  productName: string
  totalQuantity: number
}

export type RecentMovementItem = {
  createdByUserId: string
  date: string
  id: string
  observation?: string | null
  totalItems: number
  totalQuantity: number
  type: MovementType
  warehouseDestinationName?: string | null
  warehouseOriginName?: string | null
}

export type LowStockAlertItem = {
  minimumStock: number
  missingQuantity: number
  productCode: string
  productId: string
  productName: string
  quantity: number
  warehouseId: string
  warehouseName: string
}
