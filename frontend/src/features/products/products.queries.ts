import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCategories } from '../categories/categories.api'
import { getSuppliers } from '../suppliers/suppliers.api'
import type { CreateProductRequest, ProductFilters, UpdateProductRequest } from '../../types/product'
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from './products.api'

export const productsQueryKeys = {
  all: ['products'] as const,
  categoryOptions: ['products', 'category-options'] as const,
  detail: (id: string) => ['products', id] as const,
  list: (params: ProductFilters) => ['products', params] as const,
  supplierOptions: ['products', 'supplier-options'] as const,
}

export function useProducts(params: ProductFilters) {
  return useQuery({
    queryFn: () => getProducts(params),
    queryKey: productsQueryKeys.list(params),
  })
}

export function useProduct(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getProductById(id ?? ''),
    queryKey: id ? productsQueryKeys.detail(id) : ['products', 'detail'],
  })
}

export function useProductCategoryOptions() {
  return useQuery({
    queryFn: () => getCategories({ pageNumber: 1, pageSize: 100 }),
    queryKey: productsQueryKeys.categoryOptions,
  })
}

export function useProductSupplierOptions() {
  return useQuery({
    queryFn: () => getSuppliers({ pageNumber: 1, pageSize: 100 }),
    queryKey: productsQueryKeys.supplierOptions,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductRequest }) => updateProduct(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all })
    },
  })
}
