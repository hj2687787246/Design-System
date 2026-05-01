import type { AllOrder, AllOrderSummary } from '../types/AllOrders'

export type RowKeyGetter<T> = (row: T) => string | number

export const getAllOrderSelectionKey = (order: Pick<AllOrder, 'id' | 'orderNo'>) => order.id || order.orderNo

export const getAllOrderSummarySelectionKey = (order: Pick<AllOrderSummary, 'id' | 'index'>) => order.id || order.index

export const getPagedRows = <T>(rows: T[], pageNo: number, pageSize: number): T[] => {
  const normalizedPageNo = Math.max(pageNo, 1)
  const normalizedPageSize = Math.max(pageSize, 1)
  const start = (normalizedPageNo - 1) * normalizedPageSize

  return rows.slice(start, start + normalizedPageSize)
}

export const mergePagedSelection = <T>(
  previousSelection: T[],
  currentSelection: T[],
  currentPageRows: T[],
  getRowKey: RowKeyGetter<T>,
): T[] => {
  const currentPageKeys = new Set(currentPageRows.map(getRowKey))
  const merged = new Map<string | number, T>()

  previousSelection.forEach((row) => {
    const key = getRowKey(row)

    if (!currentPageKeys.has(key)) {
      merged.set(key, row)
    }
  })

  currentSelection.forEach((row) => {
    const key = getRowKey(row)

    if (currentPageKeys.has(key)) {
      merged.set(key, row)
    }
  })

  return Array.from(merged.values())
}
