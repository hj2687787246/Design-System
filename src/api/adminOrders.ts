import type { AxiosResponse } from 'axios'
import request from '../libs/request'
import type { PageResponse } from './types'
import type { OrderId } from '../types/AllOrders'
import type { CreateOrderImportError } from '../types/CreateOrder'

export interface OrderOptionItem {
  id?: OrderId
  name?: string
  value?: string
  label?: string
}

export interface OrderFilterOptionsVO {
  shops?: OrderOptionItem[]
  productTypes?: OrderOptionItem[]
  statuses?: OrderOptionItem[]
  designers?: OrderOptionItem[]
}

export interface AdminOrderPageQuery {
  pageNo?: number
  pageSize?: number
  shopIds?: OrderId[]
  productTypeNames?: string[]
  statuses?: string[]
  designerIds?: OrderId[]
  startTime?: string
  endTime?: string
  keyword?: string
}

export interface AdminOrderRecordVO {
  id: OrderId
  index?: number
  orderNo: string
  shopId?: OrderId
  shopName?: string
  merchant?: string
  productTypeId?: OrderId
  productTypeName?: string
  photoType?: string
  status?: string
  statusName?: string
  designerId?: OrderId | null
  designerName?: string | null
  designer?: string | null
  photoCount?: number
  acceptUnitPrice?: string | number | null
  acceptTotalAmount?: string | number | null
  receivePrice?: string | number | null
  receiveTotal?: string | number | null
  dispatchUnitPrice?: string | number | null
  dispatchTotalAmount?: string | number | null
  dispatchPrice?: string | number | null
  dispatchTotal?: string | number | null
  customerInfo?: string
  customer?: string
  remark?: string
  orderedAt?: string
  completedAt?: string | null
}

export interface AdminOrderSummaryVO {
  id: OrderId
  index?: number
  shopId?: OrderId
  shopName?: string
  merchant?: string
  orderCount?: number
  photoCount?: number
  acceptTotalAmount?: string | number
  receiveTotal?: string | number
  dispatchTotalAmount?: string | number
  dispatchTotal?: string | number
  profitAmount?: string | number
  profit?: string | number
  orderTime?: string
  orderedAt?: string
}

export interface AdminOrderGroupVO {
  groupId?: OrderId
  groupName?: string
  name?: string
  orders?: AdminOrderRecordVO[]
}

export interface AdminOrderSaveParams {
  id?: OrderId
  orderNo: string
  merchantName?: string
  shopId?: OrderId
  productTypeId?: OrderId
  customerInfo: string
  photoType?: string
  productTypeName?: string
  photoCount: number
  acceptUnitPrice: string | number
  dispatchUnitPrice: string | number
  orderedAt: string
  status?: string
  remark?: string
}

export interface DispatchOrderParams {
  id: OrderId
  designerId: OrderId
}

export interface ExportSelectedOrdersParams {
  tableType: 'DETAIL' | 'SUMMARY'
  ids: OrderId[]
}

export interface AdminOrderBatchRowParams {
  merchantName?: string
  photoType?: string
  orderNo: string
  customerInfo: string
  photoCount: number | string
  acceptUnitPrice: number | string
  dispatchUnitPrice: number | string
  orderedAt: string
  remark?: string
}

export interface AdminOrderBatchCreateParams {
  merchantName?: string
  shopId?: OrderId
  photoType?: string
  productTypeName?: string
  productTypeId?: OrderId
  orders: AdminOrderBatchRowParams[]
}

export interface AdminOrderImportPreviewRow {
  index: number
  excelRowNumber?: number
  merchantName?: string
  photoType?: string
  customerInfo?: string
  photoCount?: string | number
  acceptUnitPrice?: string | number
  dispatchUnitPrice?: string | number
  orderNo?: string
  orderedAt?: string
  remark?: string
}

export interface AdminOrderImportPreviewVO {
  valid: boolean
  rows: AdminOrderImportPreviewRow[]
  errors: CreateOrderImportError[]
}

export const getOrderFilterOptionsApi = () =>
  request<OrderFilterOptionsVO>({
    url: '/orders/filter-options',
    method: 'GET',
  }) as unknown as Promise<OrderFilterOptionsVO>

export const getAdminOrderListApi = (data: AdminOrderPageQuery) =>
  request<PageResponse<AdminOrderRecordVO>>({
    url: '/admin/orders/list',
    method: 'POST',
    data,
  }) as unknown as Promise<PageResponse<AdminOrderRecordVO>>

export const getAdminOrderSummaryListApi = (data: AdminOrderPageQuery) =>
  request<PageResponse<AdminOrderSummaryVO>>({
    url: '/admin/orders/summary/list',
    method: 'POST',
    data,
  }) as unknown as Promise<PageResponse<AdminOrderSummaryVO>>

export const createAdminOrderApi = (data: AdminOrderSaveParams) =>
  request<AdminOrderRecordVO>({
    url: '/admin/orders',
    method: 'POST',
    data,
  }) as unknown as Promise<AdminOrderRecordVO>

export const createAdminOrdersBatchApi = (data: AdminOrderBatchCreateParams) =>
  request<AdminOrderRecordVO[]>({
    url: '/admin/orders/batch',
    method: 'POST',
    data,
  }) as unknown as Promise<AdminOrderRecordVO[]>

export const previewAdminOrdersImportApi = (file: File) => {
  const data = new FormData()
  data.append('file', file)

  return request<AdminOrderImportPreviewVO>({
    url: '/admin/orders/import/preview',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as unknown as Promise<AdminOrderImportPreviewVO>
}

export const updateAdminOrderApi = (data: AdminOrderSaveParams & { id: OrderId }) =>
  request<AdminOrderRecordVO>({
    url: '/admin/orders',
    method: 'PUT',
    data,
  }) as unknown as Promise<AdminOrderRecordVO>

export const deleteAdminOrderApi = (id: OrderId) =>
  request<boolean>({
    url: `/admin/orders/${id}`,
    method: 'DELETE',
  }) as unknown as Promise<boolean>

export const dispatchAdminOrderApi = (data: DispatchOrderParams) =>
  request<AdminOrderRecordVO | boolean>({
    url: '/admin/orders/dispatch',
    method: 'POST',
    data,
  }) as unknown as Promise<AdminOrderRecordVO | boolean>

export const approveAdminOrderApi = (id: OrderId) =>
  request<AdminOrderRecordVO | boolean>({
    url: '/admin/orders/approve',
    method: 'POST',
    data: { id },
  }) as unknown as Promise<AdminOrderRecordVO | boolean>

export const rejectAdminOrderApi = (id: OrderId) =>
  request<AdminOrderRecordVO | boolean>({
    url: '/admin/orders/reject',
    method: 'POST',
    data: { id },
  }) as unknown as Promise<AdminOrderRecordVO | boolean>

export const getAdminOrderShopGroupsApi = () =>
  request<AdminOrderGroupVO[]>({
    url: '/admin/orders/shop-groups',
    method: 'GET',
  }) as unknown as Promise<AdminOrderGroupVO[]>

export const getAdminOrderDesignerGroupsApi = () =>
  request<AdminOrderGroupVO[]>({
    url: '/admin/orders/designer-groups',
    method: 'GET',
  }) as unknown as Promise<AdminOrderGroupVO[]>

export const exportSelectedAdminOrdersApi = (data: ExportSelectedOrdersParams) =>
  request<AxiosResponse<Blob>>({
    url: '/admin/orders/export',
    method: 'POST',
    data,
    responseType: 'blob',
    rawResponse: true,
  }) as unknown as Promise<AxiosResponse<Blob>>
