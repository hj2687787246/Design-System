import type { PageResult } from '../libs/request'

export type UserRole = 'DESIGNER' | 'DISPATCHER' | 'ADMIN'
export type UserStatus = 'ENABLED' | 'DISABLED'
export type OrderStatus = 'UNASSIGNED' | 'UNCOMPLETED' | 'PENDING_REVIEW' | 'COMPLETED' | 'PROBLEM' | 'OTHER'
export type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'SELECT'
export type ReviewAction = 'APPROVE' | 'REJECT' | 'SET_PROBLEM' | 'SET_OTHER'
export type ExportTableType = 'DETAIL' | 'SUMMARY'
export type HeaderDetailType = 'SHOP' | 'DESIGNER'

export type PageResponse<T> = PageResult<T>

export interface CommonPageParams {
  pageNo?: number
  pageSize?: number
}

export interface UserVO {
  id: number
  username: string
  realName: string
  role: UserRole
  phone?: string
  status: UserStatus
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CurrentUserVO {
  id: number
  username: string
  realName: string
  role: UserRole
  phone?: string
  status: UserStatus
  menus: string[]
}

export interface LoginResultVO {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  refreshExpiresIn: number
  user: Pick<CurrentUserVO, 'id' | 'username' | 'realName' | 'role' | 'status'>
}

export interface ShopVO {
  id: number
  shopName: string
  ownerName?: string
  contactPhone?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface ProductTypeFieldVO {
  id: number
  productTypeId: number
  fieldKey: string
  fieldLabel: string
  fieldType: FieldType
  required: boolean
  defaultValue?: string
  options: string[]
  sortOrder?: number
}

export interface ProductTypeVO {
  id: number
  shopId: number
  shopName: string
  typeName: string
  defaultAcceptPrice: string
  defaultDispatchPrice: string
  sortOrder?: number
  fields: ProductTypeFieldVO[]
  createdAt: string
  updatedAt: string
}

export interface OrderDynamicFieldValue {
  fieldId: number
  fieldValue?: string
}

export interface OrderVO {
  id: number
  orderNo: string
  shopId: number
  shopName: string
  customerId: number
  customerInfo: string
  productTypeId: number
  productTypeName: string
  photoCount: number
  acceptUnitPrice?: string | null
  acceptTotalAmount?: string | null
  dispatchUnitPrice?: string | null
  dispatchTotalAmount?: string | null
  designerId?: number | null
  designerName?: string | null
  status: OrderStatus
  requirementText?: string
  remark?: string
  orderedAt: string
  submittedAt?: string | null
  reviewedAt?: string | null
  dispatchedAt?: string | null
  completedAt?: string | null
  dynamicFields?: OrderDynamicFieldValue[]
  createdAt?: string
  updatedAt?: string
}

export interface OrderSummaryVO {
  shopId: number
  shopName: string
  orderCount: number
  photoCount: number
  acceptTotalAmount: string
  dispatchTotalAmount: string
  profitAmount: string
  orderTime: string
}

export interface OverviewVO {
  unassignedCount: number
  uncompletedCount: number
  pendingReviewCount: number
  completedCount: number
  problemCount: number
  otherCount: number
}

export interface HeaderDetailRecordVO {
  shopName?: string
  customerName?: string
  orderNo?: string
  photoCount?: number
  unitPrice?: string
  remark?: string
  orderedAt?: string
  designerName?: string
  [key: string]: unknown
}

export interface HeaderDetailVO {
  type: HeaderDetailType
  records: HeaderDetailRecordVO[]
}

export interface OperationLogVO {
  id: number
  operatorId: number
  operatorName: string
  operatorRole: UserRole
  actionType: string
  targetType: string
  targetId: number
  targetName: string
  content: string
  createdAt: string
}

