<template>
  <section class="user-management-view">
    <header class="user-management-header">
      <h1>用户管理</h1>
      <el-button class="add-user-button" type="primary" :icon="Plus" @click="openCreateDialog">新增用户</el-button>
    </header>

    <main class="user-management-body">
      <el-form class="user-filter" :model="filters" inline @submit.prevent>
        <el-form-item>
          <el-input v-model="filters.keyword" clearable placeholder="输入用户名或账号" @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item>
          <el-select v-model="filters.role" clearable placeholder="角色筛选">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button class="query-button" type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <div class="user-table-panel">
        <el-table v-loading="tableLoading" :data="users" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border height="100%">
          <el-table-column label="用户名" prop="realName" />
          <el-table-column label="登录账号" prop="username" />
          <el-table-column label="当前角色">
            <template #default="{ row }">
              {{ getRoleLabel(row.role) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createdAt" />
          <el-table-column class-name="operation-column-cell" fixed="right" label="操作" width="136">
            <template #default="{ row }">
              <div class="user-action-buttons">
                <el-button class="edit-button" plain size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
                <el-popconfirm
                  v-if="!isCurrentUser(row)"
                  :title="getDeleteUserTitle(row)"
                  :width="getPopconfirmWidth(getDeleteUserTitle(row))"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  @confirm="handleDeleteUser(row)"
                >
                  <template #reference>
                    <el-button class="delete-button" plain size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <footer class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[15, 30, 45, 60]"
          :pager-count="5"
          :total="userTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </footer>
    </main>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" class="account-settings-dialog" width="480px" :show-close="false" destroy-on-close>
      <el-form ref="userFormRef" class="account-settings-form" :model="userForm" :rules="userRules" label-position="left">
        <el-form-item label="用户名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item :label="dialogMode === 'create' ? '用户角色' : '当前角色'" prop="role">
          <el-select v-model="userForm.role" :disabled="isRoleLocked" placeholder="请选择当前角色">
            <el-option v-if="userForm.role === 'ADMIN'" disabled label="超级管理员" value="ADMIN" />
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="登录账号" prop="username">
          <el-input
            v-model.trim="userForm.username"
            :disabled="dialogMode === 'edit'"
            :name="dialogMode === 'create' ? 'new-user-account' : 'edit-user-account'"
            autocomplete="off"
            placeholder="请输入登录账号"
          />
        </el-form-item>

        <el-form-item label="登录密码" prop="password">
          <el-input v-model="userForm.password" autocomplete="new-password" name="new-user-password" placeholder="请输入登录密码" show-password type="password" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="saveLoading" @click="dialogVisible = false">取消</el-button>
        <el-button :loading="saveLoading" type="primary" @click="handleSaveUser">提交</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { createUserApi, deleteUserApi, getUserListApi, updateUserApi } from '../api/users'
import type { UserRole, UserStatus, UserVO } from '../api/types'
import { RequestError } from '../libs/request'
import { getStoredUser, setStoredUser } from '../libs/request/auth'
import { getPopconfirmWidth } from '../utils/popconfirmWidth'

type UserTableRole = Extract<UserRole, 'ADMIN' | 'DISPATCHER' | 'DESIGNER'>
type EditableUserRole = Exclude<UserTableRole, 'ADMIN'>
type DialogMode = 'create' | 'edit'

interface UserFilters {
  keyword: string
  role: UserTableRole | ''
}

interface UserForm {
  id?: number
  realName: string
  username: string
  password: string
  role: UserTableRole
  status: UserStatus
}

const roleLabelMap: Record<UserRole, string> = {
  ADMIN: '超级管理员',
  DISPATCHER: '调度',
  DESIGNER: '设计师'
}

const roleOptions: Array<{ label: string; value: EditableUserRole }> = [
  { label: '调度', value: 'DISPATCHER' },
  { label: '设计师', value: 'DESIGNER' }
]

const getRoleLabel = (role: UserRole) => roleLabelMap[role]
const getErrorMessage = (error: unknown, fallback: string) => (error instanceof RequestError ? error.message : fallback)
const isCurrentUser = (row: UserVO) => currentUser.value?.id === row.id

const filters = reactive<UserFilters>({
  keyword: '',
  role: ''
})

const activeFilters = reactive<UserFilters>({
  keyword: '',
  role: ''
})

const pagination = reactive({
  pageNo: 1,
  pageSize: 15
})

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('create')
const userFormRef = ref<FormInstance>()
const saveLoading = ref(false)
const userForm = reactive<UserForm>({
  realName: '',
  username: '',
  password: '',
  role: 'DISPATCHER',
  status: 'ENABLED'
})
const users = ref<UserVO[]>([])
const userTotal = ref(0)
const tableLoading = ref(false)
const currentUser = ref(getStoredUser())

const dialogTitle = computed(() => (dialogMode.value === 'edit' ? '编辑用户' : '新增用户'))
const isEditingCurrentUser = computed(() => dialogMode.value === 'edit' && Boolean(userForm.id && currentUser.value?.id === userForm.id))
const isRoleLocked = computed(() => isEditingCurrentUser.value || userForm.role === 'ADMIN')

const requiredRule = (message: string) => [{ required: true, whitespace: true, message, trigger: 'blur' }]
const passwordRules = [
  { required: true, whitespace: true, message: '请输入登录密码', trigger: 'blur' },
  { min: 6, message: '登录密码不能少于6位字符', trigger: 'blur' }
]

const userRules = computed<FormRules<UserForm>>(() => {
  const rules: FormRules<UserForm> = {
    realName: requiredRule('请输入用户名'),
    username: requiredRule('请输入登录账号'),
    password: passwordRules,
    role: [{ required: true, message: '请选择当前角色', trigger: 'change' }]
  }

  return rules
})

const resetUserForm = () => {
  userForm.id = undefined
  userForm.realName = ''
  userForm.username = ''
  userForm.password = ''
  userForm.role = 'DISPATCHER'
  userForm.status = 'ENABLED'
}

const fetchUserList = async () => {
  tableLoading.value = true

  try {
    const result = await getUserListApi({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      keyword: activeFilters.keyword.trim() || undefined,
      role: activeFilters.role === 'ADMIN' ? undefined : activeFilters.role || undefined
    })

    users.value = result.records
    userTotal.value = result.total

    const maxPageNo = Math.max(1, Math.ceil(result.total / pagination.pageSize))
    if (pagination.pageNo > maxPageNo) {
      pagination.pageNo = maxPageNo
    }
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '查询用户列表失败'))
  } finally {
    tableLoading.value = false
  }
}

const handleSearch = () => {
  activeFilters.keyword = filters.keyword
  activeFilters.role = filters.role
  pagination.pageNo = 1
  void fetchUserList()
}

const handlePageChange = (pageNo: number) => {
  pagination.pageNo = pageNo
  void fetchUserList()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.pageNo = 1
  void fetchUserList()
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  resetUserForm()
  dialogVisible.value = true
  void nextTick(() => {
    resetUserForm()
    userFormRef.value?.clearValidate()
    window.requestAnimationFrame(() => {
      resetUserForm()
      userFormRef.value?.clearValidate()
    })
  })
}

const openEditDialog = (row: UserVO) => {
  dialogMode.value = 'edit'
  userForm.id = row.id
  userForm.realName = row.realName
  userForm.username = row.username
  userForm.password = ''
  userForm.role = row.role
  userForm.status = row.status
  dialogVisible.value = true
  void nextTick(() => userFormRef.value?.clearValidate())
}

const handleSaveUser = async () => {
  if (!userFormRef.value || saveLoading.value) return

  try {
    await userFormRef.value.validate()
  } catch {
    return
  }

  saveLoading.value = true

  try {
    if (dialogMode.value === 'edit' && userForm.id) {
      const updatePayload = {
        realName: userForm.realName.trim(),
        username: userForm.username.trim(),
        role: userForm.role,
        status: 'ENABLED' as const,
        newPassword: userForm.password
      }

      await updateUserApi(userForm.id, updatePayload)

      if (isEditingCurrentUser.value && currentUser.value) {
        const nextUser = {
          ...currentUser.value,
          realName: userForm.realName.trim()
        }

        setStoredUser(nextUser)
        currentUser.value = nextUser
      }

      ElMessage.success('编辑账号成功')
    } else {
      if (userForm.role === 'ADMIN') {
        throw new RequestError('接口不支持创建超级管理员账号', 400)
      }

      await createUserApi({
        username: userForm.username.trim(),
        password: userForm.password,
        realName: userForm.realName.trim(),
        role: userForm.role
      })
      ElMessage.success('创建账号成功')
    }

    dialogVisible.value = false
    await fetchUserList()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '保存用户失败'))
  } finally {
    saveLoading.value = false
  }
}

const getDeleteUserTitle = (row: UserVO) => `确定删除账号“${row.username}”吗？删除后不可恢复。`

const handleDeleteUser = async (row: UserVO) => {
  try {
    await deleteUserApi(row.id)

    if (users.value.length === 1 && pagination.pageNo > 1) {
      pagination.pageNo -= 1
      await fetchUserList()
    } else {
      await fetchUserList()
    }

    ElMessage({
      type: 'success',
      message: '删除成功!',
    })
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '删除用户失败'))
  }
}

onMounted(() => {
  void fetchUserList()
})
</script>

<style scoped lang="scss">
.user-management-view {
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #001b44;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 18px 50px rgba(0, 15, 42, 0.18);
}

.user-management-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid #e8eef7;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }
}

.add-user-button {
  width: 91px;
  height: 36px;
  padding: 0;
  font-size: 14px;
  font-weight: 800;
  border-radius: 8px;
}

.user-management-body {
  display: grid;
  grid-template-rows: 64px minmax(0, 1fr) 72px;
  min-height: 0;
  overflow: hidden;
}

.user-filter {
  display: grid;
  grid-template-columns: 182px 226px 62px;
  gap: 10px;
  align-items: center;
  align-content: center;
  padding: 0 22px;
  margin: 0;

  :deep(.el-form-item) {
    margin: 0;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 34px;
    border-radius: 5px;
    box-shadow: 0 0 0 1px #d8e2f1 inset;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder) {
    color: #001b44;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-select__placeholder) {
    color: #9db0ca;
  }
}

.query-button {
  width: 62px;
  height: 34px;
  padding: 0;
  font-size: 14px;
  font-weight: 800;
  border-radius: 8px;
}

.user-table-panel {
  min-height: 0;
  padding: 0 22px;
  overflow: hidden;
  background: #fff;

  :deep(.el-table) {
    --el-table-border-color: #dfe7f2;
    --el-table-header-bg-color: #f3f6fb;
    --el-table-row-hover-bg-color: #f8fbff;
    --el-table-tr-bg-color: #fff;
    --el-table-text-color: #001b44;
    --el-table-header-text-color: #001b44;
    font-size: 14px;
  }

  :deep(.el-table__inner-wrapper::before) {
    background: #dfe7f2;
  }

  :deep(.el-table__header th) {
    height: 40px;
    font-weight: 800;
    background: #f3f6fb;
  }

  :deep(.el-table__row td) {
    height: 42px;
    font-weight: 500;
  }

  :deep(.el-table__cell) {
    padding: 0;
  }

  :deep(.cell) {
    padding: 0 12px;
    line-height: 40px;
  }
}

.edit-button,
.delete-button {
  font-weight: 700;
}

.user-action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;

  .el-button + .el-button {
    margin-left: 0;
  }
}

:deep(.operation-column-cell) {
  text-align: left !important;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-pager) {
    gap: 6px;
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

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 36px;
    border-radius: 6px;
    box-shadow: 0 0 0 1px #d4dfef inset;
  }

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-input__inner) {
    color: #001b44;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder) {
    color: #9db0ca;
  }
}

@media (max-width: 980px) {
  .user-filter {
    grid-template-columns: 1fr;
    padding: 14px 18px;
  }

  .user-management-body {
    grid-template-rows: auto minmax(0, 1fr) 72px;
  }

  .user-table-panel {
    padding: 0 18px;
  }
}
</style>
