import { useQuery } from '@tanstack/react-query'
import {
  getKardexSummaryReport,
  getLowStockReport,
  getMovementsSummaryReport,
  getStockSummaryReport,
} from './reports.api'

export function useStockSummaryReport() {
  return useQuery({
    queryFn: getStockSummaryReport,
    queryKey: ['reports', 'stock-summary'],
  })
}

export function useLowStockReport() {
  return useQuery({
    queryFn: getLowStockReport,
    queryKey: ['reports', 'low-stock'],
  })
}

export function useMovementsSummaryReport() {
  return useQuery({
    queryFn: getMovementsSummaryReport,
    queryKey: ['reports', 'movements-summary'],
  })
}

export function useKardexSummaryReport() {
  return useQuery({
    queryFn: getKardexSummaryReport,
    queryKey: ['reports', 'kardex-summary'],
  })
}
