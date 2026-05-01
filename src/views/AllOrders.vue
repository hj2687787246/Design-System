<template>
  <section class="all-orders-card">
    <header class="orders-title">
      <h1>全部订单</h1>
    </header>

    <el-form class="orders-filter" :model="filters" inline>
      <el-form-item>
        <el-select v-model="filters.merchants" multiple collapse-tags placeholder="商户多选">
          <el-option v-for="item in merchantOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-select v-model="filters.photoTypes" multiple collapse-tags placeholder="照片种类多选">
          <el-option v-for="item in photoTypeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-select v-model="filters.statuses" multiple collapse-tags placeholder="订单状态多选">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-select v-model="filters.designers" multiple collapse-tags placeholder="设计师多选">
          <el-option v-for="item in designerOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item class="date-form-item">
        <el-date-picker v-model="filters.dateRange" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss" range-separator="-" start-placeholder="开始时间" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>

      <el-form-item>
        <el-input v-model="filters.keyword" placeholder="输入关键词" />
      </el-form-item>

      <el-form-item>
        <el-button class="query-button" type="primary" plain :icon="Search" @click="searchOrders">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="create-order-button" type="success" plain :icon="Plus" @click="openCreateOrderDialog">新建订单</el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="summary-button" type="success" @click="toggleTableMode">
          <span v-for="(option, index) in tableModeSwitchOptions" :key="option.mode" class="table-mode-switch-text" :class="{ 'is-active': option.isActive }">
            <el-icon class="table-mode-switch-icon">
              <component :is="option.mode === 'detail' ? Document : DataAnalysis" />
            </el-icon>
            {{ option.label }}<span v-if="index === 0" class="table-mode-switch-separator">/</span>
          </span>
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="import-button" plain :icon="Upload" :loading="isImporting" @click="triggerImport">导入数据</el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="export-button" plain :icon="Download" :disabled="!selectedRows.length || isExporting" :loading="isExporting" @click="exportSelectedRows">导出数据</el-button>
      </el-form-item>
    </el-form>
    <input ref="importFileInput" class="import-file-input" type="file" accept=".xlsx" @change="handleImportFileChange" />

    <div class="table-panel">
      <AllOrdersDetailTable
        v-if="tableMode === 'detail'"
        :key="`detail-${tableRenderKey}`"
        :designer-groups="designerGroups"
        :group-loading="isGroupLoading"
        :loading="isLoading"
        :merchant-groups="merchantGroups"
        :orders="orders"
        :selected-orders="selectedDetailRows"
        @change-order-status="changeOrderStatus"
        @clear-selection="clearDetailSelection"
        @approve-order="approveOrder"
        @delete-order="deleteOrder"
        @dispatch-order="dispatchOrder"
        @edit-order="openEditOrderDialog"
        @open-designer-groups="loadDesignerGroups"
        @open-merchant-groups="loadMerchantGroups"
        @reject-order="rejectOrder"
        @reassign-order="reassignOrder"
        @selection-change="handleDetailSelectionChange"
      />
      <AllOrdersSummaryTable
        v-else
        :key="`summary-${tableRenderKey}`"
        :loading="isLoading"
        :orders="summaryOrders"
        :selected-orders="selectedSummaryRows"
        @clear-selection="clearSummarySelection"
        @selection-change="handleSummarySelectionChange"
      />
    </div>

    <footer class="pagination">
      <el-pagination v-model:current-page="pagination.pageNo" v-model:page-size="pagination.pageSize" :page-sizes="[15, 30, 45, 60]" :pager-count="5" :total="currentTotal" layout="total, sizes, prev, pager, next, jumper" @current-change="loadCurrentTable" @size-change="handlePageSizeChange" />
    </footer>

    <el-dialog v-model="isCreateOrderDialogVisible" :title="orderDialogTitle" class="create-order-dialog" :width="orderDialogWidth" destroy-on-close>
      <CreateOrder
        ref="createOrderRef"
        class="create-order-dialog-content"
        :mode="orderDialogMode"
        :import-preview="createOrderImportPreview"
        :initial-form="createOrderInitialForm"
        :merchant-options="merchantOptions"
        @confirm="handleCreateOrderConfirm"
        @submit-disabled-change="isCreateOrderSubmitDisabled = $event"
      />

      <template #footer>
        <el-button @click="isCreateOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="isCreateOrderSubmitDisabled" @click="createOrderRef?.submit()">{{ orderDialogConfirmText }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dispatchDialogVisible" :title="dispatchDialogTitle" class="dispatch-dialog" width="360px" destroy-on-close>
      <el-form label-width="72px">
        <el-form-item label="设计师">
          <el-select v-model="dispatchDesignerId" filterable placeholder="请选择设计师">
            <el-option v-for="item in designerOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dispatchDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!dispatchDesignerId" @click="confirmDispatchOrder">{{ dispatchConfirmText }}</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { DataAnalysis, Document, Download, Plus, Search, Upload } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AllOrdersDetailTable from '../components/AllOrdersDetailTable.vue'
import AllOrdersSummaryTable from '../components/AllOrdersSummaryTable.vue'
import CreateOrder from '../components/CreateOrder.vue'
import {
  approveAdminOrderApi,
  createAdminOrdersBatchApi,
  deleteAdminOrderApi,
  dispatchAdminOrderApi,
  exportSelectedAdminOrdersApi,
  getAdminOrderDesignerGroupsApi,
  getAdminOrderListApi,
  getAdminOrderShopGroupsApi,
  getAdminOrderSummaryListApi,
  getOrderFilterOptionsApi,
  previewAdminOrdersImportApi,
  rejectAdminOrderApi,
  updateAdminOrderApi,
  type AdminOrderImportPreviewVO,
  type AdminOrderGroupVO,
  type AdminOrderRecordVO,
  type AdminOrderSummaryVO,
} from '../api/adminOrders'
import { assignOrderApi } from '../api/orders'
import type { AllOrder, AllOrderGroup, AllOrdersFilters, AllOrdersPagination, AllOrderSummary, OrderId } from '../types/AllOrders'
import type { CreateOrderBatchSubmit, CreateOrderForm } from '../types/CreateOrder'
import { createTableModeSwitchOptions, type AllOrdersTableMode } from '../utils/allOrdersTableMode'
import { getAllOrderSelectionKey, getAllOrderSummarySelectionKey, mergePagedSelection } from '../utils/allOrdersSelection'
import { normalizePriceNumberOrZero, toPricePayload } from '../utils/price'

type OrderDialogMode = 'create' | 'edit'
type DispatchDialogMode = 'dispatch' | 'reassign'

interface SelectOption {
  id: OrderId
  name: string
}

interface StatusOption {
  value: string
  label: string
}

const filters = reactive<AllOrdersFilters>({
  merchants: [],
  photoTypes: [],
  statuses: [],
  designers: [],
  dateRange: [] as string[],
  keyword: ''
})

const pagination = reactive<AllOrdersPagination>({
  pageNo: 1,
  pageSize: 15
})

const selectedDetailRows = ref<AllOrder[]>([])
const selectedSummaryRows = ref<AllOrderSummary[]>([])
const orders = ref<AllOrder[]>([])
const summaryOrders = ref<AllOrderSummary[]>([])
const merchantGroups = ref<AllOrderGroup[]>([])
const designerGroups = ref<AllOrderGroup[]>([])
const currentTotal = ref(0)
const isLoading = ref(false)
const isGroupLoading = ref(false)
const isExporting = ref(false)
const isImporting = ref(false)
const tableMode = ref<AllOrdersTableMode>('detail')
const tableRenderKey = ref(0)
const isCreateOrderDialogVisible = ref(false)
const dispatchDialogVisible = ref(false)
const createOrderRef = ref<InstanceType<typeof CreateOrder>>()
const importFileInput = ref<HTMLInputElement>()
const orderDialogMode = ref<OrderDialogMode>('create')
const dispatchDialogMode = ref<DispatchDialogMode>('dispatch')
const dispatchTargetOrder = ref<AllOrder | null>(null)
const dispatchDesignerId = ref<OrderId | undefined>()
const orderDialogTitle = computed(() => (orderDialogMode.value === 'edit' ? '编辑订单' : '新建订单'))
const orderDialogConfirmText = computed(() => (orderDialogMode.value === 'edit' ? '确认修改' : '确认添加'))
const orderDialogWidth = computed(() => (orderDialogMode.value === 'edit' ? '860px' : '1400px'))
const dispatchDialogTitle = computed(() => (dispatchDialogMode.value === 'reassign' ? '改派' : '派单'))
const dispatchConfirmText = computed(() => (dispatchDialogMode.value === 'reassign' ? '改派' : '派单'))
const tableModeSwitchOptions = computed(() => createTableModeSwitchOptions(tableMode.value))
const selectedRows = computed(() => (tableMode.value === 'detail' ? selectedDetailRows.value : selectedSummaryRows.value))
const isCreateOrderSubmitDisabled = ref(false)

const getEmptyCreateOrderForm = (): CreateOrderForm => ({
  id: undefined,
  merchantName: '',
  shopId: undefined,
  customerInfo: '',
  photoType: '',
  photoCount: undefined,
  acceptUnitPrice: undefined,
  dispatchUnitPrice: undefined,
  orderNo: '',
  orderedAt: '',
  status: '',
  remark: ''
})

const createOrderInitialForm = ref<CreateOrderForm>(getEmptyCreateOrderForm())
const createOrderImportPreview = ref<AdminOrderImportPreviewVO | null>(null)

const merchantOptions = ref<SelectOption[]>([])
const photoTypeOptions = ref<string[]>([])
const statusOptions = ref<StatusOption[]>([])
const designerOptions = ref<SelectOption[]>([])

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return 0

  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback
}

const normalizeOrder = (record: AdminOrderRecordVO, fallbackIndex: number): AllOrder => ({
  id: record.id,
  index: record.index ?? fallbackIndex,
  shopId: record.shopId,
  productTypeId: record.productTypeId,
  merchant: record.merchant ?? record.shopName ?? '',
  photoType: record.photoType ?? record.productTypeName ?? '',
  statusCode: record.status,
  status: record.statusName ?? record.status ?? '',
  designerId: record.designerId ?? null,
  designer: record.designer ?? record.designerName ?? '',
  orderNo: record.orderNo,
  photoCount: toNumber(record.photoCount),
  receivePrice: normalizePriceNumberOrZero(record.receivePrice ?? record.acceptUnitPrice),
  receiveTotal: normalizePriceNumberOrZero(record.receiveTotal ?? record.acceptTotalAmount),
  dispatchPrice: normalizePriceNumberOrZero(record.dispatchPrice ?? record.dispatchUnitPrice),
  dispatchTotal: normalizePriceNumberOrZero(record.dispatchTotal ?? record.dispatchTotalAmount),
  customer: record.customer ?? record.customerInfo ?? '',
  remark: record.remark ?? '',
  orderedAt: record.orderedAt ?? '',
  completedAt: record.completedAt ?? '',
})

const normalizeSummary = (record: AdminOrderSummaryVO, fallbackIndex: number): AllOrderSummary => ({
  id: record.id,
  index: record.index ?? fallbackIndex,
  shopId: record.shopId,
  merchant: record.merchant ?? record.shopName ?? '',
  orderCount: toNumber(record.orderCount),
  photoCount: toNumber(record.photoCount),
  receiveTotal: normalizePriceNumberOrZero(record.receiveTotal ?? record.acceptTotalAmount),
  dispatchTotal: normalizePriceNumberOrZero(record.dispatchTotal ?? record.dispatchTotalAmount),
  profit: normalizePriceNumberOrZero(record.profit ?? record.profitAmount),
  orderedAt: record.orderedAt ?? record.orderTime ?? '',
})

const normalizeGroup = (group: AdminOrderGroupVO): AllOrderGroup => ({
  groupId: group.groupId,
  groupName: group.groupName ?? group.name ?? '未填写',
  orders: (group.orders ?? []).map((order, index) => normalizeOrder(order, index + 1)),
})

const buildQuery = () => ({
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize,
  shopIds: filters.merchants.length ? filters.merchants : undefined,
  productTypeNames: filters.photoTypes.length ? filters.photoTypes : undefined,
  statuses: filters.statuses.length ? filters.statuses : undefined,
  designerIds: filters.designers.length ? filters.designers : undefined,
  startTime: filters.dateRange?.[0] || undefined,
  endTime: filters.dateRange?.[1] || undefined,
  keyword: filters.keyword.trim() || undefined,
})

const loadFilterOptions = async () => {
  try {
    const options = await getOrderFilterOptionsApi()

    merchantOptions.value = (options.shops ?? [])
      .filter(item => item.id !== undefined && item.name)
      .map(item => ({ id: item.id as OrderId, name: item.name as string }))
    photoTypeOptions.value = (options.productTypes ?? []).map(item => item.name).filter((name): name is string => Boolean(name))
    statusOptions.value = (options.statuses ?? [])
      .filter(item => item.value && item.label)
      .map(item => ({ value: item.value as string, label: item.label as string }))
    designerOptions.value = (options.designers ?? [])
      .filter(item => item.id !== undefined && item.name)
      .map(item => ({ id: item.id as OrderId, name: item.name as string }))
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '筛选项加载失败'))
  }
}

const loadDetailOrders = async () => {
  const result = await getAdminOrderListApi(buildQuery())
  orders.value = result.records.map((item, index) => normalizeOrder(item, (pagination.pageNo - 1) * pagination.pageSize + index + 1))
  currentTotal.value = result.total
}

const loadSummaryOrders = async () => {
  const result = await getAdminOrderSummaryListApi(buildQuery())
  summaryOrders.value = result.records.map((item, index) => normalizeSummary(item, (pagination.pageNo - 1) * pagination.pageSize + index + 1))
  currentTotal.value = result.total
}

const loadCurrentTable = async () => {
  isLoading.value = true

  try {
    if (tableMode.value === 'detail') {
      await loadDetailOrders()
    } else {
      await loadSummaryOrders()
    }
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '订单列表加载失败'))
  } finally {
    isLoading.value = false
  }
}

const handleDetailSelectionChange = (selection: AllOrder[]) => {
  selectedDetailRows.value = mergePagedSelection(selectedDetailRows.value, selection, orders.value, getAllOrderSelectionKey)
}

const handleSummarySelectionChange = (selection: AllOrderSummary[]) => {
  selectedSummaryRows.value = mergePagedSelection(selectedSummaryRows.value, selection, summaryOrders.value, getAllOrderSummarySelectionKey)
}

const clearDetailSelection = () => {
  selectedDetailRows.value = []
  tableRenderKey.value += 1
}

const clearSummarySelection = () => {
  selectedSummaryRows.value = []
  tableRenderKey.value += 1
}

const resetTableSwitchState = () => {
  filters.keyword = ''
  selectedDetailRows.value = []
  selectedSummaryRows.value = []
  pagination.pageNo = 1
  tableRenderKey.value += 1
}

const toggleTableMode = () => {
  tableMode.value = tableMode.value === 'detail' ? 'summary' : 'detail'
  resetTableSwitchState()
  void loadCurrentTable()
}

const mapOrderToCreateOrderForm = (order: AllOrder): CreateOrderForm => {
  const matchedMerchant = merchantOptions.value.find(item => item.id === order.shopId || item.name === order.merchant)

  return {
    id: order.id,
    merchantName: matchedMerchant?.name ?? order.merchant,
    shopId: matchedMerchant?.id ?? order.shopId,
    productTypeId: order.productTypeId,
    customerInfo: order.customer,
    photoType: order.photoType,
    photoCount: order.photoCount,
    acceptUnitPrice: order.receivePrice,
    dispatchUnitPrice: order.dispatchPrice,
    orderNo: order.orderNo,
    orderedAt: order.orderedAt,
    status: order.statusCode || order.status,
    remark: order.remark,
  }
}

const openCreateOrderDialog = () => {
  orderDialogMode.value = 'create'
  createOrderInitialForm.value = getEmptyCreateOrderForm()
  createOrderImportPreview.value = null
  isCreateOrderSubmitDisabled.value = false
  isCreateOrderDialogVisible.value = true
}

const openEditOrderDialog = (order: AllOrder) => {
  orderDialogMode.value = 'edit'
  createOrderInitialForm.value = mapOrderToCreateOrderForm(order)
  createOrderImportPreview.value = null
  isCreateOrderSubmitDisabled.value = false
  isCreateOrderDialogVisible.value = true
}

const buildOrderPayload = (form: CreateOrderForm) => ({
  orderNo: form.orderNo,
  merchantName: form.merchantName,
  shopId: form.shopId,
  productTypeId: form.productTypeId,
  customerInfo: form.customerInfo,
  photoType: form.photoType,
  productTypeName: form.photoType,
  photoCount: form.photoCount || 0,
  acceptUnitPrice: toPricePayload(form.acceptUnitPrice) ?? 0,
  dispatchUnitPrice: toPricePayload(form.dispatchUnitPrice) ?? 0,
  orderedAt: form.orderedAt,
  status: form.status || undefined,
  remark: form.remark,
})

const isBatchSubmit = (form: CreateOrderForm | CreateOrderBatchSubmit): form is CreateOrderBatchSubmit => {
  return 'orders' in form
}

const buildBatchCreatePayload = (form: CreateOrderBatchSubmit) => ({
  merchantName: form.merchantName,
  shopId: form.shopId,
  photoType: form.photoType,
  productTypeName: form.productTypeName,
  productTypeId: form.productTypeId,
  orders: form.orders.map(row => ({
    orderNo: row.orderNo,
    customerInfo: row.customerInfo,
    photoCount: row.photoCount ?? 0,
    acceptUnitPrice: toPricePayload(row.acceptUnitPrice) ?? 0,
    dispatchUnitPrice: toPricePayload(row.dispatchUnitPrice) ?? 0,
    orderedAt: row.orderedAt,
    remark: row.remark,
  })),
})

const handleCreateOrderConfirm = async (form: CreateOrderForm | CreateOrderBatchSubmit) => {
  try {
    if (!isBatchSubmit(form) && orderDialogMode.value === 'edit' && form.id !== undefined) {
      await updateAdminOrderApi({
        id: form.id,
        ...buildOrderPayload(form),
      })
      ElMessage.success('订单修改成功')
    } else if (isBatchSubmit(form)) {
      await createAdminOrdersBatchApi(buildBatchCreatePayload(form))
      ElMessage.success('订单创建成功')
    } else {
      throw new Error('订单数据不完整')
    }

    isCreateOrderDialogVisible.value = false
    await loadCurrentTable()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '订单保存失败'))
  }
}

const buildOrderPayloadFromRow = (order: AllOrder) => {
  const matchedMerchant = merchantOptions.value.find(item => item.id === order.shopId || item.name === order.merchant)

  return {
    orderNo: order.orderNo,
    merchantName: matchedMerchant?.name ?? order.merchant,
    shopId: matchedMerchant?.id ?? order.shopId,
    productTypeId: order.productTypeId,
    customerInfo: order.customer,
    photoType: order.photoType,
    productTypeName: order.photoType,
    photoCount: order.photoCount,
    acceptUnitPrice: order.receivePrice,
    dispatchUnitPrice: order.dispatchPrice,
    orderedAt: order.orderedAt,
    remark: order.remark,
  }
}

const changeOrderStatus = async (order: AllOrder, status: string) => {
  try {
    await updateAdminOrderApi({
      id: order.id,
      ...buildOrderPayloadFromRow(order),
      status,
    })
    ElMessage.success('状态修改成功')
    await loadCurrentTable()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '状态修改失败'))
  }
}

const searchOrders = () => {
  pagination.pageNo = 1
  selectedDetailRows.value = []
  selectedSummaryRows.value = []
  tableRenderKey.value += 1
  void loadCurrentTable()
}

const handlePageSizeChange = () => {
  pagination.pageNo = 1
  void loadCurrentTable()
}

const deleteOrder = async (order: AllOrder) => {
  try {
    await deleteAdminOrderApi(order.id)
    ElMessage({
      type: 'success',
      message: '删除成功!',
    })
    await loadCurrentTable()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '订单删除失败'))
  }
}

const dispatchOrder = (order: AllOrder) => {
  dispatchDialogMode.value = 'dispatch'
  dispatchTargetOrder.value = order
  dispatchDesignerId.value = undefined
  dispatchDialogVisible.value = true
}

const reassignOrder = (order: AllOrder) => {
  dispatchDialogMode.value = 'reassign'
  dispatchTargetOrder.value = order
  dispatchDesignerId.value = order.designerId ?? undefined
  dispatchDialogVisible.value = true
}

const confirmDispatchOrder = async () => {
  if (!dispatchTargetOrder.value || !dispatchDesignerId.value) return

  try {
    if (dispatchDialogMode.value === 'reassign') {
      await assignOrderApi(Number(dispatchTargetOrder.value.id), {
        designerId: Number(dispatchDesignerId.value),
      })
      ElMessage.success('改派成功')
    } else {
      await dispatchAdminOrderApi({
        id: dispatchTargetOrder.value.id,
        designerId: dispatchDesignerId.value,
      })
      ElMessage.success('派单成功')
    }

    dispatchDialogVisible.value = false
    await loadCurrentTable()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, dispatchDialogMode.value === 'reassign' ? '改派失败' : '派单失败'))
  }
}

const approveOrder = async (order: AllOrder) => {
  try {
    await approveAdminOrderApi(order.id)
    ElMessage.success('审核通过成功')
    await loadCurrentTable()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '审核通过失败'))
  }
}

const rejectOrder = async (order: AllOrder) => {
  try {
    await rejectAdminOrderApi(order.id)
    ElMessage.success('退回成功')
    await loadCurrentTable()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '退回失败'))
  }
}

const loadMerchantGroups = async () => {
  isGroupLoading.value = true

  try {
    merchantGroups.value = (await getAdminOrderShopGroupsApi()).map(normalizeGroup)
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商家分组加载失败'))
  } finally {
    isGroupLoading.value = false
  }
}

const loadDesignerGroups = async () => {
  isGroupLoading.value = true

  try {
    designerGroups.value = (await getAdminOrderDesignerGroupsApi()).map(normalizeGroup)
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '设计师分组加载失败'))
  } finally {
    isGroupLoading.value = false
  }
}

const exportSelectedRows = async () => {
  if (!selectedRows.value.length) return

  isExporting.value = true

  try {
    const response = await exportSelectedAdminOrdersApi({
      tableType: tableMode.value === 'detail' ? 'DETAIL' : 'SUMMARY',
      ids: selectedRows.value.map(row => row.id),
    })
    const blob = response.data
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'orders.xlsx'
    link.click()
    window.URL.revokeObjectURL(objectUrl)
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '导出失败'))
  } finally {
    isExporting.value = false
  }
}

const triggerImport = () => {
  importFileInput.value?.click()
}

const handleImportFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  isImporting.value = true

  try {
    const preview = await previewAdminOrdersImportApi(file)
    orderDialogMode.value = 'create'
    createOrderInitialForm.value = getEmptyCreateOrderForm()
    createOrderImportPreview.value = preview
    isCreateOrderSubmitDisabled.value = !preview.valid || preview.errors.length > 0
    isCreateOrderDialogVisible.value = true

    if (!preview.valid || preview.errors.length > 0) {
      ElMessage.warning('导入数据存在错误，请修改 Excel 后重新上传。')
    } else {
      ElMessage.success('导入解析成功，请预览确认后提交。')
    }
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '导入解析失败'))
  } finally {
    isImporting.value = false
  }
}

onMounted(() => {
  void loadFilterOptions()
  void loadCurrentTable()
})
</script>

<style scoped lang="scss">
.all-orders-card {
  display: grid;
  grid-template-rows: 56px minmax(64px, auto) minmax(0, 1fr) 72px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #001b44;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 18px 50px rgba(0, 15, 42, 0.18);
}

.orders-title {
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

.create-order-button {
  height: 34px;
  width: 112px;
  padding: 0 14px;
  font-weight: 800;
  border-radius: 8px;
}

.orders-filter {
  display: grid;
  grid-template-columns:
    minmax(112px, 1fr)
    minmax(112px, 1fr)
    minmax(112px, 1fr)
    minmax(112px, 1fr)
    minmax(220px, 1.9fr)
    minmax(128px, 1.15fr)
    64px
    100px
    132px
    96px
    96px;
  gap: 10px;
  align-items: center;
  align-content: center;
  min-height: 64px;
  padding: 12px 22px;
  margin: 0;
  overflow-x: hidden;
  overflow-y: hidden;

  :deep(.el-form-item) {
    margin: 0;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 33px;
    box-shadow: 0 0 0 1px #d8e2f1 inset;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-range-input) {
    color: #001b44;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-select__placeholder),
  :deep(.el-range-input::placeholder),
  :deep(.el-range-separator) {
    color: #8ca0bd;
  }
}

.date-form-item {
  :deep(.el-date-editor) {
    width: 100%;
    height: 33px;
  }
}

.query-button,
.import-button,
.export-button,
.summary-button {
  height: 34px;
  padding: 0;
  font-weight: 800;
  border-radius: 8px;
}

.query-button {
  width: 64px;
}

.import-button {
  width: 96px;
  color: #0f766e;
  background: #fff;
  border: 1px solid #d8e2f1;
}

.export-button {
  width: 96px;
  color: #1f5fe8;
  background: #fff;
  border: 1px solid #d8e2f1;

  &.is-disabled,
  &.is-disabled:hover {
    color: #a8abb2;
    cursor: not-allowed;
    background: #f5f7fa;
    border-color: #dcdfe6;
  }
}

.summary-button {
  width: 132px;
  color: #001b44;
  background: #fff;
  border: 1px solid #d8e2f1;

  :deep(span) {
    display: inline-flex;
    align-items: center;
  }

  &:hover,
  &:focus {
    color: #001b44;
    background: #f8fbff;
    border-color: #8fb6ff;
  }
}

.table-mode-switch-text {
  min-width: 55px;
  gap: 3px;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: #4f6688;
  transition:
    color 0.16s ease,
    font-size 0.16s ease,
    font-weight 0.16s ease;

  &.is-active {
    color: #0057ff;
    font-size: 16px;
    font-weight: 900;
  }
}

.table-mode-switch-icon {
  font-size: 13px;
}

.table-mode-switch-separator {
  margin: 0 2px 0 4px;
  color: #9cadc5;
  font-size: 13px;
  font-weight: 600;
}

.table-panel {
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

  :deep(.el-table__header th) {
    height: 39px;
    font-weight: 800;
  }

  :deep(.el-table__row td) {
    height: 41px;
    font-weight: 500;
  }

  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: #f8fbff;
  }

  :deep(.el-checkbox__inner) {
    width: 14px;
    height: 14px;
    border-color: #cbd8e8;
    border-radius: 0;
  }

  :deep(.el-button + .el-button) {
    margin-left: 8px;
  }
}

.table-panel {
  :deep(.status-text),
  :deep(.summary-detail-button) {
    color: #0057ff;
  }
}

.import-file-input {
  display: none;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-pager) {
    gap: 6px;
  }
}

:deep(.create-order-dialog) {
  --el-dialog-padding-primary: 0;
  border-radius: 14px;
  overflow: hidden;
}

:deep(.create-order-dialog .el-dialog__header) {
  padding: 20px 34px 12px;
  margin-right: 42px;
}

:deep(.create-order-dialog .el-dialog__title) {
  color: #001b44;
  font-size: 18px;
  font-weight: 800;
  line-height: 24px;
}

:deep(.create-order-dialog .el-dialog__headerbtn) {
  top: 11px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: 8px;

  &:hover {
    background: #eef4ff;
  }
}

:deep(.create-order-dialog .el-dialog__body) {
  padding: 0;
}

.create-order-dialog-content {
  border-radius: 0;
  box-shadow: none;
}

:deep(.create-order-dialog .el-dialog__footer) {
  padding: 12px 34px 24px;
}

:deep(.dispatch-dialog) {
  border-radius: 12px;
}

:deep(.dispatch-dialog .el-dialog__body) {
  padding: 16px 24px 2px;
}

:deep(.dispatch-dialog .el-select) {
  width: 100%;
}

@media (max-width: 1500px) {
  .all-orders-card {
    grid-template-rows: 56px minmax(64px, auto) minmax(0, 1fr) 72px;
  }

  .orders-filter {
    grid-template-columns:
      minmax(112px, 1fr)
      minmax(112px, 1fr)
      minmax(112px, 1fr)
      minmax(112px, 1fr)
      minmax(220px, 1.9fr)
      minmax(128px, 1.15fr)
      64px
      100px
      132px
      96px
      96px;
    padding: 12px 22px;
  }

  .date-form-item {
    grid-column: auto;
  }
}

@media (max-width: 900px) {
  .orders-filter {
    grid-template-columns:
      minmax(112px, 1fr)
      minmax(112px, 1fr)
      minmax(112px, 1fr)
      minmax(112px, 1fr)
      minmax(220px, 1.9fr)
      minmax(128px, 1.15fr)
      64px
      100px
      132px
      96px
      96px;
  }

  .date-form-item {
    grid-column: auto;
  }
}
</style>
