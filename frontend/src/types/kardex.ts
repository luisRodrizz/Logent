import type { PaginatedResponse, PaginationParams } from './pagination'

export type KardexMovementType = 'Entry' | 'Exit' | 'Transfer' | 'Adjustment'

export type KardexEntry = {
  createdByUserId: string
  date: string
  id: string
  movementId?: string | null
  movementType: KardexMovementType
  observation?: string | null
  productCode: string
  productId: string
  productName: string
  quantity: number
  stockAfter: number
  stockBefore: number
  unitCost: number
  warehouseId: string
  warehouseName: string
}

export type KardexFilters = PaginationParams

export type KardexListResponse = PaginatedResponse<KardexEntry>
