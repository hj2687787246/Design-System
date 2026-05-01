<template>
  <section class="master-data-view master-data-card">
    <header class="master-data-header">
      <h1>商户管理</h1>
      <el-button class="add-button" type="primary" :icon="Plus" @click="openCreateDialog">新增商户</el-button>
    </header>

    <main class="master-data-body">
      <div class="merchant-toolbar">
        <el-input v-model.trim="filters.merchantName" clearable placeholder="请输入商户名称关键词" @clear="searchMerchants" @keyup.enter="searchMerchants" />
        <el-button class="query-button" type="primary" @click="searchMerchants">搜索</el-button>
      </div>

      <div class="table-panel">
        <el-table v-loading="isLoading" :data="merchantRows" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border height="100%">
          <el-table-column label="商户名称" prop="merchantName" />
          <el-table-column label="照片类型">
            <template #default="{ row }: { row: MerchantRecord }">
              <div class="type-tags">
                <el-tag v-for="item in row.photoTypes" :key="item.id" effect="plain" round>{{ item.photoType }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createdAt" />
          <el-table-column class-name="operation-column-cell" fixed="right" label="操作" width="208">
            <template #default="{ row }: { row: MerchantRecord }">
              <div class="merchant-action-buttons">
                <el-button class="detail-button" plain size="small" type="primary" @click="openDetailDialog(row)">详情</el-button>
                <el-button class="edit-button" plain size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
                <el-popconfirm
                  :title="getDeleteMerchantTitle(row)"
                  :width="getPopconfirmWidth(getDeleteMerchantTitle(row))"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  @confirm="deleteMerchant(row)"
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
          :total="merchantTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadMerchants"
          @size-change="handlePageSizeChange"
        />
      </footer>
    </main>

    <el-dialog v-model="merchantDialogVisible" class="master-form-dialog merchant-dialog" :title="dialogTitle" width="1100px" top="10vh" @closed="resetMerchantForm">
      <el-form ref="merchantFormRef" class="merchant-editor-form" :disabled="isReadOnlyMode" :model="merchantForm" :rules="merchantRules" label-width="96px">
        <section class="merchant-basic-card">
          <div class="basic-title">基础信息</div>
          <el-form-item label="商户名称" prop="merchantName">
            <el-input v-model.trim="merchantForm.merchantName" placeholder="请输入商户名称" />
          </el-form-item>
        </section>

        <section class="form-section">
          <div class="section-title">
            <div>
              <span>照片类型</span>
              <small>新增时可不填，编辑时可继续补充；已填写的类型需维护默认接单价和派单价</small>
            </div>
          </div>

          <div class="card-grid photo-type-grid">
            <div v-for="(item, index) in merchantForm.photoTypes" :key="item.id" class="photo-type-card">
              <div class="card-head">
                <span>类型 {{ index + 1 }}</span>
                <el-popconfirm
                  v-if="!isReadOnlyMode"
                  :title="deletePhotoTypeTitle"
                  :width="getPopconfirmWidth(deletePhotoTypeTitle)"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  @confirm="removePhotoType(index)"
                >
                  <template #reference>
                    <el-button class="card-delete-button" :icon="Minus" plain size="small" type="danger" title="删除" />
                  </template>
                </el-popconfirm>
              </div>

              <el-form-item label="照片类型" :prop="`photoTypes.${index}.photoType`" :rules="photoTypeNameRules">
                <el-input v-model.trim="item.photoType" placeholder="请输入照片类型" />
              </el-form-item>

              <el-form-item label="默认接单价" :prop="`photoTypes.${index}.acceptPrice`" :rules="acceptPriceRules">
                <el-input-number
                  v-model="item.acceptPrice"
                  :min="0"
                  :precision="PRICE_DECIMAL_PLACES"
                  :step="1"
                  disabled-scientific
                  inputmode="decimal"
                  placeholder="请输入默认接单价"
                  @change="item.acceptPrice = normalizePriceNumber($event)"
                  @paste.capture="preventInvalidPricePaste"
                />
              </el-form-item>

              <el-form-item label="默认派单价" :prop="`photoTypes.${index}.dispatchPrice`" :rules="dispatchPriceRules">
                <el-input-number
                  v-model="item.dispatchPrice"
                  :min="0"
                  :precision="PRICE_DECIMAL_PLACES"
                  :step="1"
                  disabled-scientific
                  inputmode="decimal"
                  placeholder="请输入默认派单价"
                  @change="item.dispatchPrice = normalizePriceNumber($event)"
                  @paste.capture="preventInvalidPricePaste"
                />
              </el-form-item>
            </div>

            <button v-if="!isReadOnlyMode" class="add-card" type="button" @click="addPhotoType">
              <span class="add-card-icon">+</span>
              <span>添加类型</span>
            </button>
          </div>
        </section>

      </el-form>

      <template #footer>
        <el-button @click="merchantDialogVisible = false">{{ isReadOnlyMode ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!isReadOnlyMode" type="primary" @click="submitMerchantForm">确定</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { Minus, Plus } from '@element-plus/icons-vue'
import {
  createMerchantMasterApi,
  deleteMerchantMasterApi,
  getMerchantMasterDetailApi,
  getMerchantMasterEditDataApi,
  getMerchantMasterListApi,
  updateMerchantMasterApi,
  type MerchantMasterEditableVO,
  type MerchantMasterRecordVO,
} from '../api/merchantMaster'
import type {
  MasterDataFilters,
  MasterDataPagination,
  MerchantDialogForm,
  MerchantId,
  MerchantPhotoType,
  MerchantRecord,
} from '../types/MasterData'
import { getPopconfirmWidth } from '../utils/popconfirmWidth'
import { normalizePriceNumber, PRICE_DECIMAL_PLACES, preventInvalidPricePaste, toPricePayload } from '../utils/price'

type MerchantDialogMode = 'create' | 'edit' | 'detail'

const deletePhotoTypeTitle = '确定删除该照片类型吗？对应的默认接单价和默认派单价也会一并删除。'

const isLoading = ref(false)
const merchantDialogVisible = ref(false)
const merchantDialogMode = ref<MerchantDialogMode>('create')
const editingMerchantId = ref<MerchantId | null>(null)
const merchantFormRef = ref<FormInstance>()
const merchantRows = ref<MerchantRecord[]>([])
const merchantTotal = ref(0)

const pagination = reactive<MasterDataPagination>({
  pageNo: 1,
  pageSize: 15,
})

const filters = reactive<MasterDataFilters>({
  merchantName: '',
})

const requiredRule = (message: string, trigger: 'blur' | 'change' = 'blur'): FormItemRule[] => [{ required: true, whitespace: true, message, trigger }]
const requiredValueRule = (message: string, trigger: 'blur' | 'change' = 'blur'): FormItemRule[] => [{ required: true, message, trigger }]

const merchantRules: FormRules<MerchantDialogForm> = {
  merchantName: requiredRule('请输入商户名称'),
}

const photoTypeNameRules = requiredRule('请输入照片类型')
const acceptPriceRules = requiredValueRule('请输入默认接单价', 'change')
const dispatchPriceRules = requiredValueRule('请输入默认派单价', 'change')

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

type PhotoTypeSource = Partial<Omit<MerchantPhotoType, 'acceptPrice' | 'dispatchPrice'>> & {
  acceptPrice?: unknown
  dispatchPrice?: unknown
  defaultAcceptPrice?: unknown
  defaultDispatchPrice?: unknown
}

const createPhotoType = (source: PhotoTypeSource = {}): MerchantPhotoType => ({
  id: source.id ?? createId('type'),
  photoType: source.photoType ?? '',
  acceptPrice: normalizePriceNumber(source.acceptPrice ?? source.defaultAcceptPrice),
  dispatchPrice: normalizePriceNumber(source.dispatchPrice ?? source.defaultDispatchPrice),
})

const createEmptyForm = (): MerchantDialogForm => ({
  merchantName: '',
  photoTypes: [],
})

const normalizeMerchantRecord = (record: MerchantMasterRecordVO | MerchantMasterEditableVO, fallbackId: MerchantId = createId('merchant')): MerchantRecord => {
  return {
    id: record.id ?? fallbackId,
    merchantName: record.merchantName ?? '',
    photoTypes: (record.photoTypes ?? []).map(item => createPhotoType(item)),
    createdAt: record.createdAt ?? '',
  }
}

const cloneRecordToForm = (record: MerchantRecord): MerchantDialogForm => ({
  merchantName: record.merchantName,
  photoTypes: record.photoTypes.map(item => ({ ...item })),
})

const merchantForm = reactive<MerchantDialogForm>(createEmptyForm())

const isReadOnlyMode = computed(() => merchantDialogMode.value === 'detail')
const dialogTitle = computed(() => {
  if (merchantDialogMode.value === 'detail') return '商户详情'
  if (merchantDialogMode.value === 'edit') return '编辑商户'
  return '新增商户'
})

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback
}

const assignMerchantForm = (nextForm: MerchantDialogForm) => {
  merchantForm.merchantName = nextForm.merchantName
  merchantForm.photoTypes = nextForm.photoTypes
}

const loadMerchants = async () => {
  isLoading.value = true

  try {
    const result = await getMerchantMasterListApi({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      merchantName: filters.merchantName.trim() || undefined,
    })

    merchantRows.value = result.records.map(item => normalizeMerchantRecord(item))
    merchantTotal.value = result.total
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商户列表加载失败'))
  } finally {
    isLoading.value = false
  }
}

const searchMerchants = () => {
  pagination.pageNo = 1
  void loadMerchants()
}

const handlePageSizeChange = () => {
  pagination.pageNo = 1
  void loadMerchants()
}

const openCreateDialog = async () => {
  merchantDialogMode.value = 'create'
  editingMerchantId.value = null
  assignMerchantForm(createEmptyForm())
  merchantDialogVisible.value = true
  await nextTick()
  merchantFormRef.value?.clearValidate()
}

const openEditDialog = async (row: MerchantRecord) => {
  try {
    const record = normalizeMerchantRecord(await getMerchantMasterEditDataApi(row.id), row.id)
    merchantDialogMode.value = 'edit'
    editingMerchantId.value = row.id
    assignMerchantForm(cloneRecordToForm(record))
    merchantDialogVisible.value = true
    await nextTick()
    merchantFormRef.value?.clearValidate()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商户编辑数据加载失败'))
  }
}

const openDetailDialog = async (row: MerchantRecord) => {
  try {
    const record = normalizeMerchantRecord(await getMerchantMasterDetailApi(row.id), row.id)
    merchantDialogMode.value = 'detail'
    editingMerchantId.value = row.id
    assignMerchantForm(cloneRecordToForm(record))
    merchantDialogVisible.value = true
    await nextTick()
    merchantFormRef.value?.clearValidate()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商户详情加载失败'))
  }
}

const addPhotoType = () => {
  if (isReadOnlyMode.value) return
  merchantForm.photoTypes.push(createPhotoType())
}

const removePhotoType = (index: number) => {
  if (isReadOnlyMode.value) return

  merchantForm.photoTypes.splice(index, 1)
  ElMessage({
    type: 'success',
    message: '删除成功!',
  })
}

const resetMerchantForm = () => {
  merchantDialogMode.value = 'create'
  editingMerchantId.value = null
  assignMerchantForm(createEmptyForm())
  merchantFormRef.value?.clearValidate()
}

const buildMerchantPayload = () => ({
  merchantName: merchantForm.merchantName,
  photoTypes: merchantForm.photoTypes.map(item => {
    const acceptPrice = toPricePayload(item.acceptPrice)
    const dispatchPrice = toPricePayload(item.dispatchPrice)

    return {
      photoType: item.photoType,
      acceptPrice,
      dispatchPrice,
      defaultAcceptPrice: acceptPrice,
      defaultDispatchPrice: dispatchPrice,
    }
  }),
})

const submitMerchantForm = async () => {
  if (isReadOnlyMode.value) return
  if (!merchantFormRef.value) return

  try {
    await merchantFormRef.value.validate()
  } catch {
    return
  }

  try {
    if (editingMerchantId.value) {
      await updateMerchantMasterApi({
        id: editingMerchantId.value,
        ...buildMerchantPayload(),
      })
      ElMessage.success('商户保存成功')
    } else {
      await createMerchantMasterApi(buildMerchantPayload())
      ElMessage.success('商户新增成功')
    }

    merchantDialogVisible.value = false
    await loadMerchants()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商户保存失败'))
  }
}

const getDeleteMerchantTitle = (row: MerchantRecord) => `确定删除商户“${row.merchantName}”吗？该操作会删除商户关联数据。`

const deleteMerchant = async (row: MerchantRecord) => {
  try {
    await deleteMerchantMasterApi(row.id)
    ElMessage({
      type: 'success',
      message: '删除成功!',
    })

    if (merchantRows.value.length === 1 && pagination.pageNo > 1) {
      pagination.pageNo -= 1
    }

    await loadMerchants()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商户删除失败'))
  }
}

onMounted(() => {
  void loadMerchants()
})
</script>

<style lang="scss">
.master-data-view.master-data-card {
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

.master-data-view .master-data-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 0 30px;
  border-bottom: 1px solid #e8eef7;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }
}

.master-data-view .add-button {
  width: 91px;
  height: 36px;
  padding: 0;
  font-weight: 800;
  border-radius: 8px;
}

.master-data-view .master-data-body {
  display: grid;
  grid-template-rows: 64px minmax(0, 1fr) 70px;
  min-height: 0;
  overflow: hidden;
}

.master-data-view .merchant-toolbar {
  display: grid;
  grid-template-columns: 200px 62px;
  gap: 10px;
  align-items: center;
  align-content: center;
  padding: 0 22px;

  .el-input__wrapper {
    min-height: 34px;
    border-radius: 5px;
    box-shadow: 0 0 0 1px #d8e2f1 inset;
  }

  .el-input__inner {
    color: #001b44;
    font-size: 14px;
  }

  .el-input__inner::placeholder {
    color: #9db0ca;
  }
}

.master-data-view .table-panel {
  min-height: 0;
  padding: 0 22px;
  overflow: hidden;
  background: #fff;

  .el-table {
    --el-table-border-color: #dfe7f2;
    --el-table-header-bg-color: #f3f6fb;
    --el-table-row-hover-bg-color: #f8fbff;
    --el-table-tr-bg-color: #fff;
    --el-table-text-color: #001b44;
    --el-table-header-text-color: #001b44;
    font-size: 14px;
  }

  .el-table__header th {
    height: 41px;
    font-weight: 800;
  }

  .el-table__row td {
    height: 43px;
    font-weight: 500;
  }

  .el-table__cell {
    padding: 0;
  }
}

.master-data-view .type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 0;
}

.master-data-view .detail-button,
.master-data-view .edit-button {
  font-weight: 700;
}

.master-data-view .merchant-action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.master-data-view {
  .operation-column-cell {
    text-align: left !important;
  }
}

.master-data-view .query-button {
  width: 62px;
  height: 34px;
  padding: 0;
  font-size: 14px;
  font-weight: 800;
  border-radius: 8px;
}

.master-data-view .pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  .el-pager {
    gap: 6px;
  }
}

.master-form-dialog {
  .el-input,
  .el-select,
  .el-input-number {
    width: 100%;
  }

  .el-input-number {
    .el-input__inner {
      text-align: left;
    }
  }
}

.merchant-dialog {
  overflow: hidden;
  border-radius: 16px;

  .el-dialog__header {
    padding: 22px 26px 18px;
    border-bottom: 1px solid #e6edf7;
  }

  .el-dialog__title {
    color: #001b44;
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
  }

  .el-dialog__body {
    max-height: 66vh;
    padding: 18px 24px 8px;
    overflow-y: auto;
    background: linear-gradient(180deg, #f8fbff 0, #fff 150px);

    &::-webkit-scrollbar {
      width: var(--scrollbar-size);
    }

    &::-webkit-scrollbar-track {
      background: var(--scrollbar-track-color);
      border-radius: 999px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb-color);
      border: 2px solid var(--scrollbar-track-color);
      border-radius: 999px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--scrollbar-thumb-hover-color);
    }
  }

  .el-dialog__footer {
    padding: 14px 24px 18px;
    border-top: 1px solid #e6edf7;
    box-shadow: 0 -10px 24px rgba(0, 27, 68, 0.05);
  }

  .merchant-editor-form {
    display: grid;
    gap: 16px;
  }

  .merchant-basic-card,
  .form-section {
    padding: 18px;
    background: #fff;
    border: 1px solid #dfe8f5;
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(0, 27, 68, 0.06);
  }

  .merchant-basic-card {
    .el-form-item {
      margin-bottom: 6px;
    }
  }

  .basic-title {
    margin-bottom: 14px;
    color: #001b44;
    font-size: 15px;
    font-weight: 900;
  }

  .form-section {
    padding-bottom: 12px;
  }

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #001b44;
    font-size: 16px;
    font-weight: 900;

    small {
      display: block;
      margin-top: 5px;
      color: #7586a3;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .card-grid {
    display: grid;
    gap: 14px;
  }

  .photo-type-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .photo-type-card,
  .add-card {
    position: relative;
    display: grid;
    gap: 14px;
    padding: 16px 14px 18px;
    background: #fbfdff;
    border: 1px solid #e1eaf6;
    border-radius: 12px;
    box-shadow: 0 8px 18px rgba(0, 27, 68, 0.04);
    transition: border-color 0.18s ease;
  }

  .photo-type-card {

    &:hover {
      border-color: #7aa7ff;

      .card-delete-button {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .el-form-item {
      margin-bottom: 8px;
    }
  }

  .add-card {
    min-height: 178px;
    place-items: center;
    align-content: center;
    color: #2563eb;
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    background: #f8fbff;
    border-style: dashed;

    &:hover {
      border-color: #7aa7ff;
      background: #f2f7ff;
    }
  }

  .add-card-icon {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    color: #fff;
    font-size: 24px;
    line-height: 1;
    background: #2563eb;
    border-radius: 50%;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 26px;
    color: #0f2d5c;
    font-size: 13px;
    font-weight: 900;
  }

  .card-delete-button {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    padding: 0;
    color: #fff;
    background: #ef4444;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.24);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.16s ease, background 0.16s ease;

    &:hover {
      color: #fff;
      background: #dc2626;
      border-color: #fff;
    }

    .el-icon {
      font-size: 12px;
      font-weight: 900;
    }
  }

  .el-input__wrapper,
  .el-input-number .el-input__wrapper {
    min-height: 34px;
    border-radius: 8px;
    box-shadow: 0 0 0 1px #d8e2f1 inset;
  }

  .el-form-item__label {
    color: #465b78;
    font-weight: 700;
  }

  .el-form-item__content {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .el-form-item__error {
    position: static;
    flex: 0 0 100%;
    width: 100%;
    margin-top: 7px;
    padding-top: 0;
    line-height: 16px;
  }
}

@media (max-width: 1200px) {
  .master-data-view .merchant-toolbar,
  .master-data-view .table-panel {
    padding-right: 18px;
    padding-left: 18px;
  }
}

@media (max-width: 768px) {
  .master-data-view .merchant-toolbar {
    grid-template-columns: minmax(0, 1fr) 62px;
  }

  .merchant-dialog {
    .photo-type-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
