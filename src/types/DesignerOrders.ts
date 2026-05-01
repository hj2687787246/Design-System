export type DesignerOrderId = number | string

export interface DesignerOrder {
  id: DesignerOrderId
  merchant: string
  photoType: string
  status: string
  statusCode?: string
  designer: string
  orderNo: string
  photoCount: number
  customer: string
  remark: string
  orderedAt: string
  completedAt?: string
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

export interface DesignerOrderGroup {
  groupId?: DesignerOrderId
  groupName: string
  orders: DesignerOrder[]
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
