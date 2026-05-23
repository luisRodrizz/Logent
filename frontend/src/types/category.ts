import type { PaginatedResponse, PaginationParams } from './pagination'

export type Category = {
  createdAt: string
  description?: string | null
  id: string
  isActive: boolean
  name: string
  updatedAt?: string | null
}

export type CreateCategoryRequest = {
  description?: string | null
  name: string
}

export type UpdateCategoryRequest = {
  description?: string | null
  name: string
}

export type CategoryFilters = PaginationParams

export type CategoryListResponse = PaginatedResponse<Category>
