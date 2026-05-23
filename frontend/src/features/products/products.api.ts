import { api } from '../../lib/api'
import type {
  CreateProductRequest,
  Product,
  ProductFilters,
  ProductListResponse,
  UpdateProductRequest,
} from '../../types/product'

export async function getProducts(params: ProductFilters): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>('/products', { params })

  return response.data
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`)

  return response.data
}

export async function createProduct(payload: CreateProductRequest): Promise<Product> {
  const response = await api.post<Product>('/products', payload)

  return response.data
}

export async function updateProduct(id: string, payload: UpdateProductRequest): Promise<void> {
  await api.put(`/products/${id}`, payload)
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}
