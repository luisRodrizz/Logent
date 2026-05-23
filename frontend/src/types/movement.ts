import type { PaginatedResponse, PaginationParams } from './pagination'

export type MovementType = 'Entry' | 'Exit' | 'Transfer'

export type MovementDetail = {
  id: string
  productCode: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
}

export type Movement = {
  createdByUserId: string
  date: string
  details: MovementDetail[]
  id: string
  observation?: string | null
  type: MovementType
  warehouseDestinationId?: string | null
  warehouseDestinationName?: string | null
  warehouseOriginId?: string | null
  warehouseOriginName?: string | null
}

export type CreateMovementDetailRequest = {
  productId: string
  quantity: number
  unitCost: number
}

export type CreateMovementRequest = {
  details: CreateMovementDetailRequest[]
  observation?: string | null
  type: MovementType
  warehouseDestinationId?: string | null
  warehouseOriginId?: string | null
}

export type MovementFilters = PaginationParams

export type MovementListResponse = PaginatedResponse<Movement>
