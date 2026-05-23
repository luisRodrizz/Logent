export type PaginatedResponse<T> = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type PaginationParams = {
  pageNumber: number
  pageSize: number
  search?: string
}
