const ACCESS_TOKEN_KEY = 'design_dispatch_access_token'
const REFRESH_TOKEN_KEY = 'design_dispatch_refresh_token'
const USER_KEY = 'design_dispatch_user'

export interface StoredUser {
  id: number
  username: string
  realName: string
  role: 'DESIGNER' | 'DISPATCHER' | 'ADMIN'
  status: 'ENABLED' | 'DISABLED'
  phone?: string
  menus?: string[]
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || ''

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY) || ''

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const setStoredUser = (user: StoredUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem(USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

