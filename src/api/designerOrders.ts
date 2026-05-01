import request from '../libs/request'
import type { PageResponse } from './types'

export interface DesignerOrderPageQuery {
  pageNo?: number
  pageSize?: number
  merchants?: string[]
  photoTypes?: string[]
  statuses?: string[]
  dateRange?: string[]
  startTime?: string
  endTime?: string
  keyword?: string
}

export interface DesignerOrderRecordVO {
  id: number | string
  merchant?: string
  shopName?: string
  photoType?: string
  productTypeName?: string
  status?: string
  statusName?: string
  statusClass?: string
  designer?: string
  designerName?: string
  orderNo: string
  photoCount?: number
  customer?: string
  customerInfo?: string
  remark?: string
  orderedAt?: string
  completedAt?: string | null
}

export interface DesignerOrderGroupVO {
  groupId?: number | string
  groupName?: string
  name?: string
  orders?: DesignerOrderRecordVO[]
}

export interface CompleteDesignerOrderParams {
  id: number | string
}

export const getDesignerOrderListApi = (data: DesignerOrderPageQuery) =>
  request<PageResponse<DesignerOrderRecordVO>>({
    url: '/designer/orders/list',
    method: 'POST',
    data,
  }) as unknown as Promise<PageResponse<DesignerOrderRecordVO>>

export const completeDesignerOrderApi = (data: CompleteDesignerOrderParams) =>
  request<DesignerOrderRecordVO | boolean>({
    url: '/designer/orders/complete',
    method: 'POST',
    data,
  }) as unknown as Promise<DesignerOrderRecordVO | boolean>

export const getDesignerOrderShopGroupsApi = () =>
  request<DesignerOrderGroupVO[]>({
    url: '/designer/orders/shop-groups',
    method: 'GET',
  }) as unknown as Promise<DesignerOrderGroupVO[]>
