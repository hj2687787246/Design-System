import request from '../libs/request'
import type { PageResponse } from './types'
import type { MerchantId } from '../types/MasterData'

export interface MerchantMasterListParams {
  pageNo?: number
  pageSize?: number
  merchantName?: string
}

export interface MerchantMasterPhotoTypeVO {
  id?: MerchantId
  photoType: string
  acceptPrice?: string | number
  dispatchPrice?: string | number
  defaultAcceptPrice?: string | number
  defaultDispatchPrice?: string | number
}

export interface MerchantMasterRecordVO {
  id: MerchantId
  merchantName: string
  photoTypes?: MerchantMasterPhotoTypeVO[]
  createdAt?: string
}

export interface MerchantMasterEditableVO {
  id?: MerchantId
  merchantName: string
  photoTypes?: MerchantMasterPhotoTypeVO[]
  createdAt?: string
}

export interface SaveMerchantMasterParams {
  id?: MerchantId
  merchantName: string
  photoTypes?: Array<Omit<MerchantMasterPhotoTypeVO, 'id'>>
}

/** 商户管理页面列表，使用页面级聚合接口。 */
export const getMerchantMasterListApi = (data: MerchantMasterListParams) =>
  request<PageResponse<MerchantMasterRecordVO>>({
    url: '/merchant-master/merchants/list',
    method: 'POST',
    data,
  }) as unknown as Promise<PageResponse<MerchantMasterRecordVO>>

/** 商户详情，用于只读弹窗。 */
export const getMerchantMasterDetailApi = (id: MerchantId) =>
  request<MerchantMasterRecordVO>({
    url: `/merchant-master/merchants/${id}`,
    method: 'GET',
  }) as unknown as Promise<MerchantMasterRecordVO>

/** 新增商户，商户管理不再维护客户信息。 */
export const createMerchantMasterApi = (data: SaveMerchantMasterParams) =>
  request<MerchantMasterRecordVO>({
    url: '/merchant-master/merchants',
    method: 'POST',
    data,
  }) as unknown as Promise<MerchantMasterRecordVO>

/** 编辑前数据查询。 */
export const getMerchantMasterEditDataApi = (id: MerchantId) =>
  request<MerchantMasterEditableVO>({
    url: '/merchant-master/merchants/edit-data',
    method: 'POST',
    data: { id },
  }) as unknown as Promise<MerchantMasterEditableVO>

/** 整体保存商户编辑数据。 */
export const updateMerchantMasterApi = (data: SaveMerchantMasterParams & { id: MerchantId }) =>
  request<MerchantMasterRecordVO>({
    url: '/merchant-master/merchants',
    method: 'PUT',
    data,
  }) as unknown as Promise<MerchantMasterRecordVO>

/** 删除商户，后端会执行物理删除，页面调用前必须二次确认。 */
export const deleteMerchantMasterApi = (id: MerchantId) =>
  request<boolean>({
    url: '/merchant-master/merchants/delete',
    method: 'POST',
    data: { id },
  }) as unknown as Promise<boolean>
