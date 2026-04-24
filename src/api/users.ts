import request from '../libs/request'
import type { CommonPageParams, PageResponse, UserRole, UserStatus, UserVO } from './types'

export interface UserListParams extends CommonPageParams {
  role?: Exclude<UserRole, 'ADMIN'>
  status?: UserStatus
  keyword?: string
}

export interface CreateUserParams {
  username: string
  password: string
  realName: string
  role: Exclude<UserRole, 'ADMIN'>
  phone?: string
  status?: UserStatus
}

export interface UpdateUserParams {
  realName: string
  role: Exclude<UserRole, 'ADMIN'>
  phone?: string
  status: UserStatus
}

export interface ResetUserPasswordParams {
  newPassword: string
}

/** 获取账号分页列表，仅超级管理员可访问。 */
export const getUserListApi = (params?: UserListParams) =>
  request<PageResponse<UserVO>>({
    url: '/users',
    method: 'GET',
    params,
  })

/** 创建设计师或调度账号，仅超级管理员可访问。 */
export const createUserApi = (data: CreateUserParams) =>
  request<UserVO>({
    url: '/users',
    method: 'POST',
    data,
  })

/** 编辑账号基础信息，仅超级管理员可访问。 */
export const updateUserApi = (id: number, data: UpdateUserParams) =>
  request<UserVO>({
    url: `/users/${id}`,
    method: 'PUT',
    data,
  })

/** 删除指定账号，仅超级管理员可访问。 */
export const deleteUserApi = (id: number) =>
  request<boolean>({
    url: `/users/${id}`,
    method: 'DELETE',
  })

/** 重置指定账号密码，仅超级管理员可访问。 */
export const resetUserPasswordApi = (id: number, data: ResetUserPasswordParams) =>
  request<boolean>({
    url: `/users/${id}/password`,
    method: 'PUT',
    data,
  })

