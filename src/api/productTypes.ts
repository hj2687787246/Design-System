import request from '../libs/request'
import type { CommonPageParams, FieldType, PageResponse, ProductTypeFieldVO, ProductTypeVO } from './types'

export interface ProductTypeListParams extends CommonPageParams {
  shopId?: number
  keyword?: string
}

export interface SaveProductTypeFieldParams {
  fieldKey: string
  fieldLabel: string
  fieldType: FieldType
  required: boolean
  defaultValue?: string
  options?: string[]
  sortOrder?: number
}

export interface SaveProductTypeParams {
  shopId: number
  typeName: string
  defaultAcceptPrice: string | number
  defaultDispatchPrice: string | number
  sortOrder?: number
  fields?: SaveProductTypeFieldParams[]
}

/** 获取照片类型分页列表，可按商户和关键词查询。 */
export const getProductTypeListApi = (params?: ProductTypeListParams) =>
  request<PageResponse<ProductTypeVO>>({
    url: '/product-types',
    method: 'GET',
    params,
  }) as unknown as Promise<PageResponse<ProductTypeVO>>

/** 创建照片类型，并可同时创建该类型下的动态字段。 */
export const createProductTypeApi = (data: SaveProductTypeParams) =>
  request<ProductTypeVO>({
    url: '/product-types',
    method: 'POST',
    data,
  })

/** 编辑照片类型，并可同步更新动态字段配置。 */
export const updateProductTypeApi = (id: number, data: SaveProductTypeParams) =>
  request<ProductTypeVO>({
    url: `/product-types/${id}`,
    method: 'PUT',
    data,
  })

/** 删除照片类型，按接口文档封装；页面是否开放入口按需求规则控制。 */
export const deleteProductTypeApi = (id: number) =>
  request<boolean>({
    url: `/product-types/${id}`,
    method: 'DELETE',
  })

/** 获取指定照片类型下的动态字段定义。 */
export const getProductTypeFieldsApi = (id: number) =>
  request<ProductTypeFieldVO[]>({
    url: `/product-types/${id}/fields`,
    method: 'GET',
  })
