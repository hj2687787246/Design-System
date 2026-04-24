import request from '../libs/request'
import type { CommonPageParams, OperationLogVO, PageResponse } from './types'

export interface OperationLogListParams extends CommonPageParams {
  operatorId?: number
  actionType?: string
  targetType?: string
  startTime?: string
  endTime?: string
}

/** 获取操作日志分页列表，调度和超级管理员可访问。 */
export const getOperationLogListApi = (params?: OperationLogListParams) =>
  request<PageResponse<OperationLogVO>>({
    url: '/logs',
    method: 'GET',
    params,
  })

