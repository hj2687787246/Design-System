import request from '../libs/request'
import type { CommonPageParams, PageResponse, ShopVO } from './types'

export interface ShopListParams extends CommonPageParams {
  keyword?: string
}

export interface SaveShopParams {
  shopName: string
  ownerName?: string
  contactPhone?: string
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
