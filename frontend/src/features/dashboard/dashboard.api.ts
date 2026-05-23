import { api } from '../../lib/api'
import type {
  DashboardSummary,
  LowStockAlertItem,
  RecentMovementItem,
  StockOverviewItem,
} from '../../types/dashboard'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>('/dashboard/summary')

  return response.data
}

export async function getStockOverview(): Promise<StockOverviewItem[]> {
  const response = await api.get<StockOverviewItem[]>('/dashboard/stock-overview')

  return response.data
}

export async function getRecentMovements(): Promise<RecentMovementItem[]> {
  const response = await api.get<RecentMovementItem[]>('/dashboard/recent-movements')

  return response.data
}

export async function getLowStockAlerts(): Promise<LowStockAlertItem[]> {
  const response = await api.get<LowStockAlertItem[]>('/dashboard/low-stock-alerts')

  return response.data
}
