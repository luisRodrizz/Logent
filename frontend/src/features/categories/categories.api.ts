import { api } from '../../lib/api'
import type {
  Category,
  CategoryFilters,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../types/category'

export async function getCategories(params: CategoryFilters): Promise<CategoryListResponse> {
  const response = await api.get<CategoryListResponse>('/categories', { params })

  return response.data
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await api.get<Category>(`/categories/${id}`)

  return response.data
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const response = await api.post<Category>('/categories', payload)

  return response.data
}

export async function updateCategory(id: string, payload: UpdateCategoryRequest): Promise<void> {
  await api.put(`/categories/${id}`, payload)
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}
