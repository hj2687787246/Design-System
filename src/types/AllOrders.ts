export type OrderId = number | string

export interface AllOrder {
  id: OrderId
  index: number
  shopId?: OrderId
  productTypeId?: OrderId
  merchant: string
  photoType: string
  statusCode?: string
  status: string
  designerId?: OrderId | null
  designer: string
  orderNo: string
  photoCount: number
  receivePrice: number
  receiveTotal: number
  dispatchPrice: number
  dispatchTotal: number
  customer: string
  remark: string
  orderedAt: string
  completedAt?: string
}

export interface AllOrderSummary {
  id: OrderId
  index: number
  shopId?: OrderId
  merchant: string
  orderCount: number
  photoCount: number
  receiveTotal: number
  dispatchTotal: number
  profit: number
  orderedAt: string
}

export interface AllOrdersFilters {
  merchants: OrderId[]
  photoTypes: string[]
  statuses: string[]
  designers: OrderId[]
  dateRange: string[]
  keyword: string
}

export interface AllOrdersPagination {
  pageNo: number
  pageSize: number
}

export type AllOrderSourceRow = [
  merchant: string,
  photoType: string,
  status: string,
  designer: string,
  orderNo: string,
  photoCount: number,
  receivePrice: number,
  dispatchPrice: number,
  customer: string,
  remark: string,
  orderedAt: string,
]

export interface AllOrderGroup {
  groupId?: OrderId
  groupName: string
  orders: AllOrder[]
}
