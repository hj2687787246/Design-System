export interface AllOrder {
  index: number
  merchant: string
  photoType: string
  status: string
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
}

export interface AllOrdersFilters {
  merchants: string[]
  photoTypes: string[]
  statuses: string[]
  designers: string[]
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
