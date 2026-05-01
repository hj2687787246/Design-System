import request from '../libs/request'
import type { CommonPageParams, PageResponse, ShopCustomerVO, ShopVO } from './types'

export interface ShopListParams extends CommonPageParams {
  keyword?: string
}

export interface SaveShopParams {
  shopName: string
  ownerName?: string
  contactPhone?: string
  remark?: string
}

export interface ShopCustomerListParams extends CommonPageParams {
  keyword?: string
}

export interface SaveShopCustomerParams {
  customerName: string
  photoCount: number
  remark?: string
}

/** 获取商户分页列表，支持商户名称、负责人、联系方式关键词查询。 */
export const getShopListApi = (params?: ShopListParams) =>
  request<PageResponse<ShopVO>>({
    url: '/shops',
    method: 'GET',
    params,
  })

/** 创建商户，调度和超级管理员可访问。 */
export const createShopApi = (data: SaveShopParams) =>
  request<ShopVO>({
    url: '/shops',
    method: 'POST',
    data,
  })

/** 编辑商户基础信息，调度和超级管理员可访问。 */
export const updateShopApi = (id: number, data: SaveShopParams) =>
  request<ShopVO>({
    url: `/shops/${id}`,
    method: 'PUT',
    data,
  })

/** 删除商户，按接口文档封装；页面是否开放入口按需求规则控制。 */
export const deleteShopApi = (id: number) =>
  request<boolean>({
    url: `/shops/${id}`,
    method: 'DELETE',
  })

/** 获取指定商户下的客户分页列表。 */
export const getShopCustomerListApi = (shopId: number, params?: ShopCustomerListParams) =>
  request<PageResponse<ShopCustomerVO>>({
    url: `/shops/${shopId}/customers`,
    method: 'GET',
    params,
  }) as unknown as Promise<PageResponse<ShopCustomerVO>>

/** 为指定商户创建客户信息。 */
export const createShopCustomerApi = (shopId: number, data: SaveShopCustomerParams) =>
  request<ShopCustomerVO>({
    url: `/shops/${shopId}/customers`,
    method: 'POST',
    data,
  })

/** 编辑商户客户信息。 */
export const updateShopCustomerApi = (id: number, data: SaveShopCustomerParams) =>
  request<ShopCustomerVO>({
    url: `/shop-customers/${id}`,
    method: 'PUT',
    data,
  })

/** 删除商户客户，按接口文档封装；页面是否开放入口按需求规则控制。 */
export const deleteShopCustomerApi = (id: number) =>
  request<boolean>({
    url: `/shop-customers/${id}`,
    method: 'DELETE',
  })
