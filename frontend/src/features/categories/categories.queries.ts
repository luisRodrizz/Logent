import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/category'
import { planQueryKeys } from '../plan/plan.queries'
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from './categories.api'

export const categoriesQueryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
  list: (params: CategoryFilters) => ['categories', params] as const,
}

export function useCategories(params: CategoryFilters) {
  return useQuery({
    queryFn: () => getCategories(params),
    queryKey: categoriesQueryKeys.list(params),
  })
}

export function useCategory(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getCategoryById(id ?? ''),
    queryKey: id ? categoriesQueryKeys.detail(id) : ['categories', 'detail'],
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) => updateCategory(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all })
    },
  })
}
