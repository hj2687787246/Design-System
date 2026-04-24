import type { AxiosResponse } from 'axios'
import request from '../libs/request'
import type {
  CommonPageParams,
  ExportTableType,
  OrderDynamicFieldValue,
  OrderStatus,
  OrderSummaryVO,
  OrderVO,
  PageResponse,
  ReviewAction,
} from './types'

export interface OrderQueryParams extends CommonPageParams {
  shopId?: number
  productTypeId?: number
  status?: OrderStatus
  designerId?: number
  startTime?: string
  endTime?: string
  keyword?: string
}

export interface SaveOrderParams {
  orderNo: string
  shopId: number
  customerId: number
  productTypeId: number
  photoCount: number
  acceptUnitPrice: string | number
  dispatchUnitPrice: string | number
  requirementText?: string
  remark?: string
  orderedAt: string
  dynamicFields?: OrderDynamicFieldValue[]
}

export interface AssignOrderParams {
  designerId: number
}

export interface SubmitOrderParams {
  remark?: string
}

export interface ReviewOrderParams {
  action: ReviewAction
  reason?: string
}

export interface ExportOrdersParams extends Omit<OrderQueryParams, 'pageNo' | 'pageSize'> {
  tableType: ExportTableType
}

/** 获取订单明细分页列表，设计师仅返回本人订单，调度和管理员返回全部订单。 */
export const getOrderListApi = (params?: OrderQueryParams) =>
  request<PageResponse<OrderVO>>({
    url: '/orders',
    method: 'GET',
    params,
  })

/** 创建订单；建单时不传设计师，后端默认状态为未派单。 */
export const createOrderApi = (data: SaveOrderParams) =>
  request<OrderVO>({
    url: '/orders',
    method: 'POST',
    data,
  })

/** 获取订单详情，设计师只能查看属于自己的订单。 */
export const getOrderDetailApi = (id: number) =>
  request<OrderVO>({
    url: `/orders/${id}`,
    method: 'GET',
  })

/** 编辑订单；已完工订单编辑后仍保持已完工状态。 */
export const updateOrderApi = (id: number, data: SaveOrderParams) =>
  request<OrderVO>({
    url: `/orders/${id}`,
    method: 'PUT',
    data,
  })

/** 删除订单，按接口文档封装；删除会由后端记录操作日志。 */
export const deleteOrderApi = (id: number) =>
  request<boolean>({
    url: `/orders/${id}`,
    method: 'DELETE',
  })

/** 派单给设计师；接口文档同时支持改派，页面规则按需求控制。 */
export const assignOrderApi = (id: number, data: AssignOrderParams) =>
  request<OrderVO>({
    url: `/orders/${id}/assign`,
    method: 'PUT',
    data,
  })

/** 设计师提交本人未完工订单，提交后状态进入待审核。 */
export const submitOrderApi = (id: number, data?: SubmitOrderParams) =>
  request<OrderVO>({
    url: `/orders/${id}/submit`,
    method: 'PUT',
    data: data || {},
  })

/** 调度或管理员审核、回退、设置问题件或设置其他状态。 */
export const reviewOrderApi = (id: number, data: ReviewOrderParams) =>
  request<OrderVO>({
    url: `/orders/${id}/review`,
    method: 'PUT',
    data,
  })

/** 获取商户汇总统计分页列表，复用订单组合筛选条件。 */
export const getOrderSummaryApi = (params?: OrderQueryParams) =>
  request<PageResponse<OrderSummaryVO>>({
    url: '/orders/summary',
    method: 'GET',
    params,
  })

/** 导出当前表格数据，返回 xlsx 文件流。 */
export const exportOrdersApi = (params: ExportOrdersParams) =>
  request<AxiosResponse<Blob>>({
    url: '/orders/export',
    method: 'GET',
    params,
    responseType: 'blob',
    rawResponse: true,
  })

