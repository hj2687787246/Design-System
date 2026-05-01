import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { clearAuthStorage, getAccessToken, getRefreshToken, setTokens } from './auth'

export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = unknown> {
  records: T[]
  total: number
  pageNo: number
  pageSize: number
}

export interface RequestConfig<T = unknown> extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
  rawResponse?: boolean
  retryOnUnauthorized?: boolean
  data?: T
}

export class RequestError extends Error {
  code: number
  status?: number
  data?: unknown

  constructor(message: string, code: number, status?: number, data?: unknown) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.status = status
    this.data = data
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
const SUCCESS_CODE = 200
const LOGIN_EXPIRED_CODE = 301
const LOGIN_PATH = '/'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshTask: Promise<void> | null = null

const isRefreshRequest = (config?: AxiosRequestConfig) => {
  return Boolean(config?.url?.includes('/auth/refresh'))
}

const shouldTryRefreshToken = (config?: RequestConfig) => {
  return Boolean(config && config.retryOnUnauthorized !== false && !config.skipAuth && !isRefreshRequest(config))
}

const redirectToLogin = () => {
  clearAuthStorage()

  if (typeof window !== 'undefined' && window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH)
  }
}

const normalizeErrorMessage = (error: AxiosError<ApiResult>) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试'
  }

  if (!error.response) {
    return '网络异常，请检查后端服务或代理配置'
  }

  return error.message || '接口请求失败'
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new RequestError('登录已过期，请重新登录', 401, 401)
  }

  const response = await axios.post<ApiResult<{ accessToken: string; refreshToken?: string }>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { timeout: 15000 },
  )

  if (response.data.code !== SUCCESS_CODE) {
    throw new RequestError(response.data.message || '刷新登录状态失败', response.data.code, response.status, response.data)
  }

  setTokens(response.data.data.accessToken, response.data.data.refreshToken || refreshToken)
}

const retryRequestAfterRefresh = async (config: RequestConfig) => {
  refreshTask ||= refreshAccessToken().finally(() => {
    refreshTask = null
  })

  await refreshTask
  config.retryOnUnauthorized = false
  return service(config)
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as InternalAxiosRequestConfig & RequestConfig

    if (!requestConfig.skipAuth) {
      const token = getAccessToken()

      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`
      }
    }

    return requestConfig
  },
  (error: AxiosError) => Promise.reject(error),
)

service.interceptors.response.use(
  async (response): Promise<any> => {
    const config = response.config as RequestConfig

    if (config.rawResponse) {
      return response
    }

    const result = response.data as ApiResult

    if (result?.code === LOGIN_EXPIRED_CODE) {
      if (shouldTryRefreshToken(config)) {
        try {
          return await retryRequestAfterRefresh(config)
        } catch (refreshError) {
          redirectToLogin()
          throw refreshError
        }
      }

      redirectToLogin()
      throw new RequestError(result?.message || '登录已过期，请重新登录', LOGIN_EXPIRED_CODE, response.status, result)
    }

    if (result?.code !== SUCCESS_CODE) {
      throw new RequestError(result?.message || '接口请求失败', result?.code ?? response.status, response.status, result)
    }

    return result.data
  },
  async (error: AxiosError<ApiResult>) => {
    const config = error.config as RequestConfig | undefined
    const shouldTryRefresh = error.response?.status === 401 && shouldTryRefreshToken(config)

    if (shouldTryRefresh && config) {
      try {
        return await retryRequestAfterRefresh(config)
      } catch (refreshError) {
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.data?.code === LOGIN_EXPIRED_CODE) {
      redirectToLogin()
    } else if (error.response?.status === 401) {
      redirectToLogin()
    }

    if (config?.skipErrorHandler) {
      return Promise.reject(error)
    }

    return Promise.reject(
      new RequestError(
        normalizeErrorMessage(error),
        error.response?.data?.code ?? error.response?.status ?? 500,
        error.response?.status,
        error.response?.data,
      ),
    )
  },
)

export const request = service as AxiosInstance & {
  <T = unknown, D = unknown>(config: RequestConfig<D>): Promise<T>
  <T = unknown, D = unknown>(url: string, config?: RequestConfig<D>): Promise<T>
}

export default request
