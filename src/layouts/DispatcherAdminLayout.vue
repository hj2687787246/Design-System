<template>
  <section class="manager-shell">
    <header class="manager-topbar">
      <div class="brand" role="button" tabindex="0" @click="goHome" @keydown.enter="goHome">
        <el-icon class="brand-mark" aria-hidden="true">
          <Grid />
        </el-icon>
        <span class="brand-title">设计调度管理系统</span>
      </div>

      <div class="user-area">
        <span class="user-name">{{ userName }}</span>
        <button class="user-avatar" type="button" title="退出登录" @click="handleLogout">{{ avatarText }}</button>
      </div>
    </header>

    <div class="manager-body">
      <aside class="sidebar">
        <nav class="sidebar-menu" aria-label="后台菜单">
          <button
            v-for="item in visibleMenus"
            :key="item.path"
            :class="{ active: isActive(item.path) }"
            type="button"
            @click="router.push(item.path)"
          >
            <span class="menu-icon" aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <main class="manager-main">
        <slot>
          <RouterView />
        </slot>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { clearAuthStorage, getStoredUser } from '../libs/request/auth'

type ManagerRole = 'DISPATCHER' | 'ADMIN'

interface MenuItem {
  label: string
  path: string
  icon: string
  roles: ManagerRole[]
}

const route = useRoute()
const router = useRouter()
const user = computed(() => getStoredUser())

const roleNameMap = {
  DISPATCHER: '调度主管',
  ADMIN: '超级管理',
} as const

const menus: MenuItem[] = [
  { label: '全部订单', path: '/orders', icon: '目', roles: ['DISPATCHER', 'ADMIN'] },
  { label: '基础资料', path: '/master-data', icon: '◉', roles: ['DISPATCHER', 'ADMIN'] },
  { label: '新建订单', path: '/create-order', icon: '⊞', roles: ['DISPATCHER', 'ADMIN'] },
  { label: '派单管理', path: '/dispatch-management', icon: '↗', roles: ['DISPATCHER', 'ADMIN'] },
  { label: '用户管理', path: '/user-management', icon: '♙', roles: ['ADMIN'] },
]

const userRole = computed<ManagerRole>(() => (user.value?.role === 'ADMIN' ? 'ADMIN' : 'DISPATCHER'))
const userName = computed(() => user.value?.realName || user.value?.username || roleNameMap[userRole.value])
const avatarText = computed(() => (userRole.value === 'ADMIN' ? '管' : '调'))
const visibleMenus = computed(() => menus.filter((item) => item.roles.includes(userRole.value)))

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)

const goHome = () => {
  router.push('/orders')
}

const handleLogout = () => {
  clearAuthStorage()
  router.replace({ name: 'Login' })
}
</script>

<style scoped lang="scss">
.manager-shell {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: 72px minmax(0, 1fr);
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 100% 66%, rgba(31, 105, 241, 0.34), transparent 18%),
    linear-gradient(180deg, #0b2a5a 0 72px, #061a3a 72px 100%);

  &::before,
  &::after {
    position: fixed;
    z-index: 0;
    content: "";
    pointer-events: none;
    border: 1px solid rgba(65, 135, 255, 0.24);
    border-color: rgba(65, 135, 255, 0.24) transparent transparent transparent;
    border-radius: 50%;
  }

  &::before {
    right: -105px;
    bottom: 205px;
    width: 420px;
    height: 220px;
    transform: rotate(12deg);
  }

  &::after {
    left: -180px;
    bottom: 160px;
    width: 560px;
    height: 260px;
    transform: rotate(10deg);
  }
}

.manager-topbar {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 28px;
  background: #0b2a5a;
}

.brand {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  height: 32px;
  padding: 0;
  color: #fff;
  cursor: pointer;
}

.brand-mark {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 32px;
  color: #fff;
  font-size: 26px;
  line-height: 1;

  :deep(svg) {
    display: block;
    width: 1em;
    height: 1em;
  }
}

.brand-title {
  display: inline-flex;
  align-items: center;
  height: 32px;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
}

.user-area {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.user-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.user-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #1153d8;
  font-weight: 800;
  cursor: pointer;
  background: #dbe9ff;
  border-radius: 50%;
}

.manager-body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.sidebar {
  background: rgba(3, 18, 42, 0.82);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  padding-top: 8px;

  button {
    display: flex;
    gap: 13px;
    align-items: center;
    width: 220px;
    height: 56px;
    padding: 0 0 0 69px;
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    text-align: left;
    cursor: pointer;
    background: transparent;

    &.active {
      background: #2b66e8;
    }
  }
}

.menu-icon {
  width: 12px;
  color: #fff;
  font-size: 14px;
  line-height: 1;
  text-align: center;
}

.manager-main {
  min-width: 0;
  min-height: 0;
  padding: 18px;
  overflow: hidden;
}

@media (max-width: 980px) {
  .manager-body {
    grid-template-columns: 1fr;
  }

  .sidebar-menu {
    flex-direction: row;
    overflow-x: auto;
    padding: 10px;

    button {
      width: auto;
      min-width: 118px;
      height: 44px;
      padding: 0 18px;
      white-space: nowrap;
    }
  }

  .manager-main {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .manager-topbar {
    height: auto;
    min-height: 72px;
    padding: 16px 18px;
  }

  .brand-title {
    font-size: 20px;
  }
}
</style>
