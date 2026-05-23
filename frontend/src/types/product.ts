import type { PaginatedResponse, PaginationParams } from './pagination'

export type Product = {
  categoryId: string
  categoryName: string
  code: string
  createdAt: string
  description?: string | null
  id: string
  isActive: boolean
  minimumStock: number
  name: string
  purchasePrice: number
  salePrice: number
  supplierId?: string | null
  supplierName?: string | null
  updatedAt?: string | null
}

export type CreateProductRequest = {
  categoryId: string
  code: string
  description?: string | null
  minimumStock: number
  name: string
  purchasePrice: number
  salePrice: number
  supplierId?: string | null
}

export type UpdateProductRequest = CreateProductRequest

export type ProductFilters = PaginationParams

export type ProductListResponse = PaginatedResponse<Product>
