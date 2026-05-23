import { api } from '../../lib/api'
import type { CreateMovementRequest, Movement, MovementFilters, MovementListResponse } from '../../types/movement'

export async function getMovements(params: MovementFilters): Promise<MovementListResponse> {
  const response = await api.get<MovementListResponse>('/movements', { params })

  return response.data
}

export async function getMovementById(id: string): Promise<Movement> {
  const response = await api.get<Movement>(`/movements/${id}`)

  return response.data
}

export async function createMovement(payload: CreateMovementRequest): Promise<Movement> {
  const response = await api.post<Movement>('/movements', payload)

  return response.data
}
