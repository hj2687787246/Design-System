<template>
  <section class="designer-shell">
    <header class="designer-topbar">
      <div class="brand" role="button" tabindex="0" @click="router.push('/designer/orders')" @keydown.enter="router.push('/designer/orders')">
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

    <main class="designer-main">
      <slot>
        <RouterView />
      </slot>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import { RouterView, useRouter } from 'vue-router'
import { clearAuthStorage, getStoredUser } from '../libs/request/auth'

const router = useRouter()
const user = computed(() => getStoredUser())
const userName = computed(() => user.value?.realName || user.value?.username || '林设计')
const avatarText = computed(() => userName.value.slice(0, 1))

const handleLogout = () => {
  clearAuthStorage()
  router.replace({ name: 'Login' })
}
</script>

<style scoped lang="scss">
.designer-shell {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: 72px minmax(0, 1fr);
  height: 100vh;
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

.designer-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
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

.designer-main {
  position: relative;
  z-index: 1;
  min-height: 0;
  padding: 24px 24px 10px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .designer-shell {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .designer-topbar {
    height: auto;
    min-height: 72px;
    padding: 16px 18px;
  }

  .brand-title {
    font-size: 20px;
  }

  .designer-main {
    padding: 16px;
  }
}
</style>
