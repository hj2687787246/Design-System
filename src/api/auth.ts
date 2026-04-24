import request from '../libs/request'
import type { CurrentUserVO, LoginResultVO } from './types'

export interface LoginParams {
  username: string
  password: string
}

export interface RefreshTokenParams {
  refreshToken: string
}

export interface RefreshTokenResultVO {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  refreshExpiresIn: number
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

/** 登录，成功后返回 accessToken、refreshToken 和用户基础信息。 */
export const loginApi = (data: LoginParams) =>
  request<LoginResultVO>({
    url: '/auth/login',
    method: 'POST',
    data,
    skipAuth: true,
    retryOnUnauthorized: false,
  })

/** 刷新 Token，用 refreshToken 换取新的 accessToken 和 refreshToken。 */
export const refreshTokenApi = (data: RefreshTokenParams) =>
  request<RefreshTokenResultVO>({
    url: '/auth/refresh',
    method: 'POST',
    data,
    skipAuth: true,
    retryOnUnauthorized: false,
  })

/** 退出登录，后端仅返回成功状态，前端仍需要清理本地登录态。 */
export const logoutApi = () =>
  request<boolean>({
    url: '/auth/logout',
    method: 'POST',
  })

/** 获取当前登录用户信息和可见菜单。 */
export const getCurrentUserApi = () =>
  request<CurrentUserVO>({
    url: '/auth/me',
    method: 'GET',
  })

/** 修改当前登录用户自己的密码。 */
export const changePasswordApi = (data: ChangePasswordParams) =>
  request<boolean>({
    url: '/auth/password',
    method: 'PUT',
    data,
  })

