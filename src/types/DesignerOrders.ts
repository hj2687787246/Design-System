export interface DesignerOrder {
  merchant: string
  photoType: string
  status: string
  designer: string
  orderNo: string
  photoCount: number
  customer: string
  remark: string
  orderedAt: string
  statusClass: string
}

export interface DesignerOrdersFilters {
  merchants: string[]
  photoTypes: string[]
  statuses: string[]
  dateRange: string[]
  keyword: string
}

export interface DesignerOrdersPagination {
  pageNo: number
  pageSize: number
}

export type DesignerOrderSourceRow = [
  merchant: string,
  photoType: string,
  status: string,
  designer: string,
  orderNo: string,
  photoCount: number,
  customer: string,
  remark: string,
  orderedAt: string,
]
