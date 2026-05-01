import type { AllOrder, AllOrderSummary } from '../types/AllOrders'
import { createDetailStatValues, createSummaryStatValues, formatOrderStatNumber } from './allOrdersStats'

const detailOrders: AllOrder[] = [
  {
    id: 1,
    index: 1,
    merchant: '云帆摄影',
    photoType: '精修',
    status: '已完工',
    designer: '林设计',
    orderNo: 'DD20260427001',
    photoCount: 3,
    receivePrice: 12,
    receiveTotal: 36,
    dispatchPrice: 8,
    dispatchTotal: 24,
    customer: '李小姐',
    remark: '',
    orderedAt: '2026-04-27 10:00:00',
  },
]

const summaryOrders: AllOrderSummary[] = [
  {
    id: 'summary-1',
    index: 1,
    merchant: '云帆摄影',
    orderCount: 2,
    photoCount: 9,
    receiveTotal: 120,
    dispatchTotal: 80,
    profit: 40,
    orderedAt: '2026-04-27 00:00:00',
  },
]

const detailStats = createDetailStatValues(detailOrders)
const summaryStats = createSummaryStatValues(summaryOrders)
const formattedValue = formatOrderStatNumber(summaryStats.receiveTotal)

detailStats satisfies { photoCount: number; receiveTotal: number; dispatchTotal: number }
summaryStats satisfies { orderCount: number; photoCount: number; receiveTotal: number; dispatchTotal: number; profit: number }
formattedValue satisfies string
