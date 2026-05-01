import type { AllOrder, AllOrderSummary } from '../types/AllOrders'
import { formatPriceNumber, normalizePriceNumberOrZero } from './price'

export interface DetailStatValues {
  photoCount: number
  receiveTotal: number
  dispatchTotal: number
}

export interface SummaryStatValues extends DetailStatValues {
  orderCount: number
  profit: number
}

const sumBy = <T>(items: T[], selector: (item: T) => number) =>
  normalizePriceNumberOrZero(items.reduce((total, item) => total + selector(item), 0))

export const formatOrderStatNumber = (value: number) => formatPriceNumber(value)

export const createDetailStatValues = (orders: AllOrder[]): DetailStatValues => ({
  photoCount: sumBy(orders, (order) => order.photoCount),
  receiveTotal: sumBy(orders, (order) => order.receiveTotal),
  dispatchTotal: sumBy(orders, (order) => order.dispatchTotal),
})

export const createSummaryStatValues = (orders: AllOrderSummary[]): SummaryStatValues => ({
  orderCount: sumBy(orders, (order) => order.orderCount),
  photoCount: sumBy(orders, (order) => order.photoCount),
  receiveTotal: sumBy(orders, (order) => order.receiveTotal),
  dispatchTotal: sumBy(orders, (order) => order.dispatchTotal),
  profit: sumBy(orders, (order) => order.profit),
})
