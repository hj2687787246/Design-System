import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken, getStoredUser } from '../libs/request/auth'
import { getHomePath, LOGIN_ROUTE_NAME, routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const hasToken = Boolean(getAccessToken())
  const isPublicRoute = Boolean(to.meta.public)
  const user = getStoredUser()

  if (!hasToken && !isPublicRoute) {
    return {
      name: LOGIN_ROUTE_NAME,
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (hasToken && to.name === LOGIN_ROUTE_NAME) {
    return getHomePath()
  }

  const hasDeniedRoute = to.matched.some((record) => {
    const allowedRoles = record.meta.roles || []
    return allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))
  })

  if (hasToken && hasDeniedRoute) {
    return getHomePath()
  }

  return true
})

export default router
