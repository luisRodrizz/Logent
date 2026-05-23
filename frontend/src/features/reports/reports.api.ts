import { api } from '../../lib/api'
import type {
  KardexSummaryReport,
  LowStockReportItem,
  MovementsSummaryReport,
  StockSummaryReport,
} from '../../types/report'

export async function getStockSummaryReport(): Promise<StockSummaryReport[]> {
  const response = await api.get<StockSummaryReport[]>('/reports/stock-summary')

  return response.data
}

export async function getLowStockReport(): Promise<LowStockReportItem[]> {
  const response = await api.get<LowStockReportItem[]>('/reports/low-stock')

  return response.data
}

export async function getMovementsSummaryReport(): Promise<MovementsSummaryReport> {
  const response = await api.get<MovementsSummaryReport>('/reports/movements-summary')

  return response.data
}

export async function getKardexSummaryReport(): Promise<KardexSummaryReport> {
  const response = await api.get<KardexSummaryReport>('/reports/kardex-summary')

  return response.data
}
