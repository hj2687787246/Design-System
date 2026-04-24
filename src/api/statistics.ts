import request from '../libs/request'
import type { HeaderDetailType, HeaderDetailVO, OverviewVO } from './types'

export interface HeaderDetailParams {
  type: HeaderDetailType
  shopId?: number
  designerId?: number
  startTime?: string
  endTime?: string
}

/** 获取首页状态概览统计；设计师角色只统计本人订单。 */
export const getStatisticsOverviewApi = () =>
  request<OverviewVO>({
    url: '/statistics/overview',
    method: 'GET',
  })

/** 获取表头字段详情弹窗数据，支持商户维度和设计师维度。 */
export const getHeaderDetailApi = (params: HeaderDetailParams) =>
  request<HeaderDetailVO>({
    url: '/statistics/header',
    method: 'GET',
    params,
  })

