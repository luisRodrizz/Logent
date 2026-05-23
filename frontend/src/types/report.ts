export type StockSummaryReport = {
  estimatedStockValue: number
  isLowStock: boolean
  minimumStock: number
  productCode: string
  productId: string
  productName: string
  quantity: number
  warehouseId: string
  warehouseName: string
}

export type LowStockReportItem = {
  minimumStock: number
  missingQuantity: number
  productCode: string
  productId: string
  productName: string
  quantity: number
  warehouseId: string
  warehouseName: string
}

export type MovementsSummaryReport = {
  totalEntries: number
  totalExits: number
  totalMovementDetails: number
  totalMovements: number
  totalTransfers: number
  totalUnitsMoved: number
}

export type KardexSummaryReport = {
  lastMovementDate?: string | null
  totalEntries: number
  totalEntryUnits: number
  totalExitUnits: number
  totalInventoryValue: number
}
