import type { OrderId } from './AllOrders'

export interface CreateOrderMerchantOption {
  id: OrderId
  name: string
}

export interface CreateOrderForm {
  id?: number | string
  merchantName: string
  shopId?: number | string
  productTypeId?: number | string
  customerInfo: string
  photoType: string
  photoCount: number | undefined
  acceptUnitPrice: number | undefined
  dispatchUnitPrice: number | undefined
  orderNo: string
  orderedAt: string
  status?: string
  remark: string
}

export type CreateOrderRowField =
  | 'orderNo'
  | 'customerInfo'
  | 'photoCount'
  | 'acceptUnitPrice'
  | 'dispatchUnitPrice'
  | 'orderedAt'
  | 'remark'
  | 'merchantName'
  | 'photoType'

export interface CreateOrderBatchRow {
  rowKey: string
  excelRowNumber?: number
  merchantName?: string
  photoType?: string
  orderNo: string
  customerInfo: string
  photoCount: number | undefined
  acceptUnitPrice: number | undefined
  dispatchUnitPrice: number | undefined
  orderedAt: string
  remark: string
}

export interface CreateOrderImportError {
  index: number
  excelRowNumber?: number
  field: CreateOrderRowField | string
  message: string
}

export interface CreateOrderBatchForm {
  merchantName: string
  shopId?: number | string
  photoType: string
  productTypeId?: number | string
  rows: CreateOrderBatchRow[]
}

export interface CreateOrderBatchSubmit {
  merchantName: string
  shopId?: number | string
  photoType: string
  productTypeName: string
  productTypeId?: number | string
  orders: CreateOrderBatchRow[]
}

export interface CreateOrderImportPreview {
  valid: boolean
  rows: CreateOrderBatchRow[]
  errors: CreateOrderImportError[]
  message?: string
}
