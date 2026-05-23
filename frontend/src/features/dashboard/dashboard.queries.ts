import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary, getLowStockAlerts, getRecentMovements, getStockOverview } from './dashboard.api'

export function useDashboardSummary() {
  return useQuery({
    queryFn: getDashboardSummary,
    queryKey: ['dashboard', 'summary'],
  })
}

export function useStockOverview() {
  return useQuery({
    queryFn: getStockOverview,
    queryKey: ['dashboard', 'stock-overview'],
  })
}

export function useRecentMovements() {
  return useQuery({
    queryFn: getRecentMovements,
    queryKey: ['dashboard', 'recent-movements'],
  })
}

export function useLowStockAlerts() {
  return useQuery({
    queryFn: getLowStockAlerts,
    queryKey: ['dashboard', 'low-stock-alerts'],
  })
}
