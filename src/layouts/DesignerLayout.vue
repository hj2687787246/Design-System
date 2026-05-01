<template>
  <section class="designer-shell">
    <header class="designer-topbar">
      <div class="brand" role="button" tabindex="0" @click="router.push('/designer/orders')" @keydown.enter="router.push('/designer/orders')">
        <el-icon class="brand-mark" aria-hidden="true">
          <Grid />
        </el-icon>
        <span class="brand-title">管理系统</span>
      </div>

      <div class="user-area">
        <span class="user-name">{{ userName }}</span>
        <el-dropdown placement="bottom-end" popper-class="account-menu-popper" trigger="click" @command="handleUserCommand">
          <button class="user-avatar" type="button" title="账户菜单">
            <el-icon>
              <User />
            </el-icon>
          </button>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="EditPen" command="account">修改账户</el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <main class="designer-main">
      <slot>
        <RouterView />
      </slot>
    </main>

    <el-dialog v-model="accountDialogVisible" class="account-settings-dialog" title="个人设置" width="480px" :show-close="false" destroy-on-close>
      <el-form ref="accountFormRef" class="account-settings-form" :model="accountForm" :rules="accountRules" label-position="left">
        <el-form-item label="用户名" prop="realName">
          <el-input v-model="accountForm.realName" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="当前角色" prop="roleName">
          <el-input v-model="accountForm.roleName" disabled />
        </el-form-item>

        <el-form-item label="登录账号" prop="username">
          <el-input v-model="accountForm.username" autocomplete="off" disabled name="account-settings-username" placeholder="请输入登录账号" />
        </el-form-item>

        <el-form-item label="登录密码" prop="password">
          <el-input v-model="accountForm.password" autocomplete="new-password" name="account-settings-new-password" placeholder="请输入登录密码" show-password type="password" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="accountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAccount">提交</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { EditPen, Grid, SwitchButton, User } from '@element-plus/icons-vue'
import { RouterView, useRouter } from 'vue-router'
import { logoutApi } from '../api/auth'
import { updateUserApi } from '../api/users'
import { RequestError } from '../libs/request'
import { clearAuthStorage, getStoredUser, setStoredUser } from '../libs/request/auth'
import type { StoredUser } from '../libs/request/auth'

interface AccountForm {
  realName: string
  roleName: string
  username: string
  password: string
}

const router = useRouter()
const storedUser = ref<StoredUser | null>(getStoredUser())
const accountDialogVisible = ref(false)
const accountFormRef = ref<FormInstance>()
const accountForm = reactive<AccountForm>({
  realName: '',
  roleName: '',
  username: '',
  password: ''
})

const roleNameMap = {
  DESIGNER: '设计师',
  DISPATCHER: '调度主管',
  ADMIN: '超级管理员'
} as const

const requiredRule = (message: string) => [{ required: true, whitespace: true, message, trigger: 'blur' }]
const passwordRules = [
  { required: true, whitespace: true, message: '请输入登录密码', trigger: 'blur' },
  { min: 6, message: '登录密码不能少于6位字符', trigger: 'blur' }
]

const accountRules = reactive<FormRules<AccountForm>>({
  realName: requiredRule('请输入用户名'),
  roleName: requiredRule('请输入当前角色'),
  username: requiredRule('请输入登录账号'),
  password: passwordRules
})

const userRole = computed<StoredUser['role']>(() => storedUser.value?.role || 'DESIGNER')
const userName = computed(() => storedUser.value?.realName || storedUser.value?.username || roleNameMap[userRole.value])
const getErrorMessage = (error: unknown, fallback: string) => (error instanceof RequestError ? error.message : fallback)

const handleLogout = async () => {
  try {
    await logoutApi()
  } catch {
    // 退出登录必须以本地状态清理为准，接口失败也不能保留旧 token。
  } finally {
    clearAuthStorage()
    router.replace({ name: 'Login' })
  }
}

const handleUserCommand = (command: string | number | object) => {
  if (command === 'logout') {
    handleLogout()
    return
  }

  if (command === 'account') {
    openAccountDialog()
  }
}

const openAccountDialog = () => {
  accountForm.realName = storedUser.value?.realName || userName.value
  accountForm.roleName = roleNameMap[userRole.value]
  accountForm.username = storedUser.value?.username || ''
  accountForm.password = ''
  accountDialogVisible.value = true
  void nextTick(() => {
    accountForm.password = ''
    accountFormRef.value?.clearValidate()
    window.requestAnimationFrame(() => {
      accountForm.password = ''
      accountFormRef.value?.clearValidate()
    })
  })
}

const handleSaveAccount = async () => {
  if (!accountFormRef.value) return

  try {
    await accountFormRef.value.validate()
  } catch {
    return
  }

  if (!storedUser.value) {
    accountDialogVisible.value = false
    return
  }

  try {
    await updateUserApi(storedUser.value.id, {
      realName: accountForm.realName.trim(),
      username: storedUser.value.username,
      role: storedUser.value.role,
      status: 'ENABLED',
      newPassword: accountForm.password
    })

    const nextUser = {
      ...storedUser.value,
      realName: accountForm.realName.trim()
    }

    setStoredUser(nextUser)
    storedUser.value = nextUser
    accountDialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '保存个人设置失败'))
  }
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
  background: #eaf2fe;

  &::before,
  &::after {
    position: fixed;
    z-index: 0;
    content: '';
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
  overflow: hidden;
  background:
    linear-gradient(rgba(232, 244, 255, 0.72), rgba(195, 225, 255, 0.5)),
    url('../assets/tech-network-bg.svg') center 43% / cover no-repeat,
    #dceeff;
  box-shadow:
    inset 0 -1px 0 rgba(255, 255, 255, 0.72),
    0 12px 28px rgba(61, 116, 180, 0.12);
  animation: designerTechBgDrift 14s ease-in-out infinite alternate;

  &::after {
    position: absolute;
    inset: 0;
    content: '';
    pointer-events: none;
    background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.5) 42%, transparent 66%);
    opacity: 0.34;
    transform: translateX(-110%);
    animation: designerTechLightSweep 5.6s ease-in-out infinite;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

.brand {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  height: 32px;
  padding: 0;
  color: #0d1d38;
  cursor: pointer;
}

.brand-mark {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 32px;
  color: #1f5fe8;
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
  color: #0d1d38;
}

.user-area {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.user-name {
  color: #0d1d38;
  font-size: 14px;
  font-weight: 500;
}

.user-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  color: #1153d8;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  background: #dbe9ff;
  border: 0;
  border-radius: 50%;

  :deep(svg) {
    display: block;
    width: 1em;
    height: 1em;
  }
}

:deep(.account-settings-dialog) {
  --el-dialog-padding-primary: 0;
  overflow: hidden;
  border-radius: 12px;
}

:deep(.account-settings-dialog .el-dialog__header) {
  padding: 24px 26px 18px;
  border-bottom: 1px solid #e6edf7;
}

:deep(.account-settings-dialog .el-dialog__title) {
  color: #001b44;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

:deep(.account-settings-dialog .el-dialog__body) {
  padding: 28px 64px 40px 42px;
}

:deep(.account-settings-dialog .el-dialog__footer) {
  padding: 0 20px 14px;
}

.account-settings-form {
  display: grid;
  gap: 18px;

  :deep(.el-form-item) {
    align-items: center;
    margin: 0;
  }

  :deep(.el-form-item__label) {
    flex: 0 0 90px;
    width: 90px;
    padding-right: 0;
    color: #001b44;
    font-size: 14px;
    line-height: 36px;
    white-space: nowrap;
  }

  :deep(.el-form-item__content) {
    min-width: 0;
  }

  :deep(.el-form-item__error) {
    padding-top: 3px;
    color: #f56c6c;
    font-size: 12px;
  }

  :deep(.el-input__wrapper) {
    min-height: 36px;
    border-radius: 6px;
    box-shadow: 0 0 0 1px #d4dfef inset;
  }

  :deep(.el-input__inner) {
    color: #001b44;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder) {
    color: #9db0ca;
  }
}

.designer-main {
  position: relative;
  z-index: 1;
  min-height: 0;
  padding: 24px 24px 10px;
  overflow: hidden;
}

@keyframes designerTechBgDrift {
  from {
    background-position:
      0 0,
      center 43%,
      0 0;
  }
  to {
    background-position:
      0 0,
      center 58%,
      0 0;
  }
}

@keyframes designerTechLightSweep {
  0%,
  42% {
    transform: translateX(-115%);
  }
  72%,
  100% {
    transform: translateX(115%);
  }
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
