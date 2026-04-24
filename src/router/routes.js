import { getStoredUser } from '../libs/request/auth'

export const LOGIN_ROUTE_NAME = 'Login'
export const DESIGNER_HOME = '/designer/orders'
export const MANAGER_HOME = '/orders'

export const getHomePath = () => {
  const user = getStoredUser()

  return user?.role === 'DESIGNER' ? DESIGNER_HOME : MANAGER_HOME
}

const allOrders = () => import('../views/AllOrders.vue')
const masterData = () => import('../views/MasterData.vue')
const createOrder = () => import('../views/CreateOrder.vue')
const dispatchManagement = () => import('../views/DispatchManagement.vue')
const userManagement = () => import('../views/UserManagement.vue')
const designerOrders = () => import('../views/DesignerOrders.vue')

export const routes = [
  {
    path: '/',
    name: LOGIN_ROUTE_NAME,
    meta: {
      public: true,
    },
    component: () => import('../views/login.vue'),
  },
  {
    path: '/',
    component: () => import('../layouts/DispatcherAdminLayout.vue'),
    redirect: MANAGER_HOME,
    meta: {
      roles: ['DISPATCHER', 'ADMIN'],
    },
    children: [
      {
        path: 'orders',
        name: 'OrderList',
        meta: {
          title: '全部订单',
          roles: ['DISPATCHER', 'ADMIN'],
        },
        component: allOrders,
      },
      {
        path: 'master-data',
        name: 'MasterData',
        meta: {
          title: '基础资料',
          roles: ['DISPATCHER', 'ADMIN'],
        },
        component: masterData,
      },
      {
        path: 'create-order',
        name: 'OrderCreate',
        meta: {
          title: '新建订单',
          roles: ['DISPATCHER', 'ADMIN'],
        },
        component: createOrder,
      },
      {
        path: 'dispatch-management',
        name: 'DispatchManagement',
        meta: {
          title: '派单管理',
          roles: ['DISPATCHER', 'ADMIN'],
        },
        component: dispatchManagement,
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        meta: {
          title: '用户管理',
          roles: ['ADMIN'],
        },
        component: userManagement,
      },
    ],
  },
  {
    path: '/designer',
    component: () => import('../layouts/DesignerLayout.vue'),
    redirect: DESIGNER_HOME,
    meta: {
      roles: ['DESIGNER'],
    },
    children: [
      {
        path: 'orders',
        name: 'DesignerOrders',
        meta: {
          title: '全部订单',
          roles: ['DESIGNER'],
        },
        component: designerOrders,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => getHomePath(),
  },
]
