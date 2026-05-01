<template>
  <section class="designer-orders-card">
    <header class="orders-title">
      <h1>全部订单</h1>
    </header>

    <el-form class="orders-filter" :model="filters" inline>
      <el-form-item>
        <el-select v-model="filters.merchants" multiple collapse-tags placeholder="商户多选">
          <el-option v-for="item in merchantOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-select v-model="filters.photoTypes" multiple collapse-tags placeholder="照片种类多选">
          <el-option v-for="item in photoTypeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-select v-model="filters.statuses" multiple collapse-tags placeholder="订单状态多选">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>

      <el-form-item class="date-form-item">
        <el-date-picker
          v-model="filters.dateRange"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          range-separator="-"
          start-placeholder="开始时间"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 300px;"
        />
      </el-form-item>

      <el-form-item>
        <el-input v-model="filters.keyword" placeholder="输入关键词" />
      </el-form-item>

      <el-form-item>
        <el-button class="query-button" type="primary" :loading="isLoading" @click="searchOrders">查询</el-button>
      </el-form-item>
    </el-form>

    <div class="table-panel">
      <el-table v-loading="isLoading" :data="orders" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border height="100%" stripe>
        <el-table-column min-width="210" prop="merchant">
          <template #header>
            <button class="table-header-link" type="button" @click="openMerchantDialog">商家名称</button>
          </template>
        </el-table-column>
        <el-table-column label="照片类型" min-width="88" prop="photoType" />
        <el-table-column label="状态" min-width="88">
          <template #default="{ row }">
            <el-tag
              class="order-status-tag"
              :class="getStatusTagConfig(row).className"
              :type="getStatusTagConfig(row).type"
              effect="light"
              round
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设计师" min-width="88" prop="designer" />
        <el-table-column label="订单号" min-width="260" prop="orderNo" />
        <el-table-column label="照片张数" min-width="88" prop="photoCount" />
        <el-table-column label="客户信息" min-width="88" prop="customer" />
        <el-table-column label="备注" min-width="240">
          <template #default="{ row }">
            <el-tooltip :content="row.remark || '-'" placement="top" popper-class="order-remark-tooltip">
              <span class="remark-cell">{{ row.remark || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" min-width="270" prop="orderedAt" />
        <el-table-column class-name="operation-column-cell" label="操作" min-width="88">
          <template #default="{ row }">
            <el-button
              v-if="canCompleteOrder(row)"
              plain
              size="small"
              type="success"
              :loading="completingOrderId === row.id"
              @click="completeOrder(row)"
            >
              完工
            </el-button>
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
        :total="currentTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadOrders"
        @size-change="handlePageSizeChange"
      />
    </footer>

    <el-dialog v-model="merchantDialogVisible" title="商家明细" class="orders-group-dialog" width="960px">
      <el-collapse v-model="activeMerchantGroups" v-loading="isGroupLoading">
        <el-collapse-item v-for="group in merchantOrderGroups" :key="group.groupName" :name="group.groupName">
          <template #title>
            <span class="collapse-title">{{ group.groupName }}</span>
            <span class="collapse-count">{{ group.orders.length }} 单</span>
          </template>

          <el-table :data="group.orders" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border stripe>
            <el-table-column label="商家名称" min-width="120" prop="merchant" />
            <el-table-column label="客户信息" min-width="110" prop="customer" />
            <el-table-column label="订单号" min-width="150" prop="orderNo" />
            <el-table-column label="照片张数" min-width="90" prop="photoCount" />
            <el-table-column label="下单时间" min-width="180" prop="orderedAt" />
            <el-table-column label="备注" min-width="180">
              <template #default="{ row }">
                <el-tooltip :content="row.remark || '-'" placement="top" popper-class="order-remark-tooltip">
                  <span class="remark-cell">{{ row.remark || '-' }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderFilterOptionsApi } from '../api/adminOrders'
import {
  completeDesignerOrderApi,
  getDesignerOrderListApi,
  getDesignerOrderShopGroupsApi,
  type DesignerOrderGroupVO,
  type DesignerOrderRecordVO,
} from '../api/designerOrders'
import type { DesignerOrder, DesignerOrderGroup, DesignerOrdersFilters, DesignerOrdersPagination } from '../types/DesignerOrders'

interface FilterOptionItem {
  id?: number | string
  name?: string
  value?: string
  label?: string
}

interface DesignerFilterOptions {
  shops?: FilterOptionItem[]
  productTypes?: FilterOptionItem[]
  statuses?: FilterOptionItem[]
  merchants?: string[]
  photoTypes?: string[]
}

type StatusTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

interface StatusTagConfig {
  type: StatusTagType
  className: string
}

const selectableStatuses = ['未完工', '待审核', '已完工']
const statusTagConfigMap: Record<string, StatusTagConfig> = {
  未完工: {
    type: 'primary',
    className: 'is-uncompleted',
  },
  UNCOMPLETED: {
    type: 'primary',
    className: 'is-uncompleted',
  },
  待审核: {
    type: 'warning',
    className: 'is-pending-review',
  },
  PENDING_REVIEW: {
    type: 'warning',
    className: 'is-pending-review',
  },
  已完工: {
    type: 'success',
    className: 'is-completed',
  },
  COMPLETED: {
    type: 'success',
    className: 'is-completed',
  },
}

const filters = reactive<DesignerOrdersFilters>({
  merchants: [],
  photoTypes: [],
  statuses: [],
  dateRange: [],
  keyword: '',
})

const pagination = reactive<DesignerOrdersPagination>({
  pageNo: 1,
  pageSize: 15,
})

const merchantDialogVisible = ref(false)
const activeMerchantGroups = ref<string[]>([])
const merchantOrderGroups = ref<DesignerOrderGroup[]>([])
const orders = ref<DesignerOrder[]>([])
const currentTotal = ref(0)
const isLoading = ref(false)
const isGroupLoading = ref(false)
const completingOrderId = ref<DesignerOrder['id'] | null>(null)

const merchantOptions = ref<string[]>([])
const photoTypeOptions = ref<string[]>([])
const statusOptions = ref<string[]>([])

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback
}

const toNumber = (value: unknown) => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const normalizeStatusClass = (record: DesignerOrderRecordVO) => {
  if (record.statusClass) return record.statusClass

  return record.status === '未完工' || record.status === '已完工' || record.statusName === '未完工' || record.statusName === '已完工'
    ? 'blue'
    : ''
}

const getStatusTagConfig = (order: DesignerOrder) => {
  return statusTagConfigMap[order.statusCode ?? ''] ?? statusTagConfigMap[order.status] ?? statusTagConfigMap['未完工']
}

const normalizeOrder = (record: DesignerOrderRecordVO): DesignerOrder => ({
  id: record.id,
  merchant: record.merchant ?? record.shopName ?? '',
  photoType: record.photoType ?? record.productTypeName ?? '',
  status: record.statusName ?? record.status ?? '',
  statusCode: record.status,
  designer: record.designer ?? record.designerName ?? '',
  orderNo: record.orderNo,
  photoCount: toNumber(record.photoCount),
  customer: record.customer ?? record.customerInfo ?? '',
  remark: record.remark ?? '',
  orderedAt: record.orderedAt ?? '',
  completedAt: record.completedAt ?? '',
  statusClass: normalizeStatusClass(record),
})

const normalizeGroup = (group: DesignerOrderGroupVO): DesignerOrderGroup => ({
  groupId: group.groupId,
  groupName: group.groupName ?? group.name ?? '未填写',
  orders: (group.orders ?? []).map(normalizeOrder),
})

const buildQuery = () => ({
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize,
  merchants: filters.merchants.length ? filters.merchants : undefined,
  photoTypes: filters.photoTypes.length ? filters.photoTypes : undefined,
  statuses: filters.statuses.length ? filters.statuses : undefined,
  dateRange: filters.dateRange.length ? filters.dateRange : undefined,
  startTime: filters.dateRange?.[0] || undefined,
  endTime: filters.dateRange?.[1] || undefined,
  keyword: filters.keyword.trim() || undefined,
})

const loadFilterOptions = async () => {
  try {
    const options = (await getOrderFilterOptionsApi()) as DesignerFilterOptions
    const merchants = options.merchants ?? (options.shops ?? []).map(item => item.name).filter((name): name is string => Boolean(name))
    const photoTypes = options.photoTypes ?? (options.productTypes ?? []).map(item => item.name).filter((name): name is string => Boolean(name))

    merchantOptions.value = merchants
    photoTypeOptions.value = photoTypes
    statusOptions.value = selectableStatuses
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '筛选项加载失败'))
  }
}

const loadOrders = async () => {
  isLoading.value = true

  try {
    const result = await getDesignerOrderListApi(buildQuery())
    orders.value = result.records.map(normalizeOrder)
    currentTotal.value = result.total
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '订单列表加载失败'))
  } finally {
    isLoading.value = false
  }
}

const searchOrders = () => {
  pagination.pageNo = 1
  void loadOrders()
}

const handlePageSizeChange = () => {
  pagination.pageNo = 1
  void loadOrders()
}

const canCompleteOrder = (order: DesignerOrder) => {
  return order.status === '未完工' || order.statusCode === 'UNCOMPLETED'
}

const completeOrder = async (order: DesignerOrder) => {
  try {
    await ElMessageBox.confirm(`确定提交订单“${order.orderNo}”完工吗？`, '完工确认', {
      confirmButtonText: '确认完工',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  completingOrderId.value = order.id

  try {
    await completeDesignerOrderApi({ id: order.id })
    ElMessage.success('订单已提交完工')
    await loadOrders()

    if (merchantDialogVisible.value) {
      await loadMerchantGroups()
    }
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '提交完工失败'))
  } finally {
    completingOrderId.value = null
  }
}

const loadMerchantGroups = async () => {
  isGroupLoading.value = true

  try {
    merchantOrderGroups.value = (await getDesignerOrderShopGroupsApi()).map(normalizeGroup)
    activeMerchantGroups.value = merchantOrderGroups.value.map(group => group.groupName)
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '商家明细加载失败'))
  } finally {
    isGroupLoading.value = false
  }
}

const openMerchantDialog = () => {
  merchantDialogVisible.value = true
  void loadMerchantGroups()
}

onMounted(() => {
  void loadFilterOptions()
  void loadOrders()
})

</script>

<style scoped lang="scss">
.designer-orders-card {
  display: grid;
  grid-template-rows: 70px 64px minmax(0, 1fr) 72px;
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
  padding: 0 30px;
  border-bottom: 1px solid #e8eef7;

  h1 {
    margin: 0;
    font-size: 25px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }
}

.orders-filter {
  display: grid;
  grid-template-columns: 177px 177px 177px 400px 221px 62px;
  gap: 10px;
  align-items: center;
  min-height: 0;
  padding: 0 22px;
  margin: 0;

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
    width: 400px;
    height: 33px;
  }
}

.query-button {
  width: 62px;
  height: 33px;
  padding: 0;
  font-weight: 800;
  border-radius: 8px;
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
    height: 41px;
    font-weight: 800;
  }

  :deep(.el-table__row td) {
    height: 41px;
    font-weight: 500;
  }

  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: #f8fbff;
  }
}

.table-header-link {
  padding: 0;
  color: #0057ff;
  font: inherit;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover,
  &:focus-visible {
    color: #003fbd;
    text-decoration: underline;
  }
}

.remark-cell {
  display: -webkit-box;
  max-height: 60px;
  overflow: hidden;
  line-height: 20px;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

:deep(.operation-column-cell) {
  text-align: left !important;
}

.order-status-tag {
  min-width: 58px;
  justify-content: center;
  border-color: var(--status-tag-border-color);
  color: var(--status-tag-text-color);
  background: var(--status-tag-bg-color);
  font-weight: 700;

  &.is-uncompleted {
    --status-tag-text-color: #1d4ed8;
    --status-tag-bg-color: #eff6ff;
    --status-tag-border-color: #bfdbfe;
  }

  &.is-pending-review {
    --status-tag-text-color: #b45309;
    --status-tag-bg-color: #fffbeb;
    --status-tag-border-color: #fde68a;
  }

  &.is-completed {
    --status-tag-text-color: #15803d;
    --status-tag-bg-color: #f0fdf4;
    --status-tag-border-color: #bbf7d0;
  }
}

.collapse-title {
  color: #001b44;
  font-size: 15px;
  font-weight: 800;
}

.collapse-count {
  margin-left: 10px;
  color: #6b7f9d;
  font-size: 13px;
  font-weight: 700;
}

:deep(.orders-group-dialog) {
  --el-dialog-padding-primary: 0;
  border-radius: 14px;
  overflow: hidden;
}

:deep(.orders-group-dialog .el-dialog__header) {
  padding: 20px 28px 14px;
  margin-right: 42px;
  border-bottom: 1px solid #e8eef7;
}

:deep(.orders-group-dialog .el-dialog__title) {
  color: #001b44;
  font-size: 18px;
  font-weight: 800;
}

:deep(.orders-group-dialog .el-dialog__body) {
  max-height: 72vh;
  padding: 16px 22px 24px;
  overflow: auto;
  background: #f8fbff;
}

:deep(.orders-group-dialog .el-collapse) {
  border-top: 0;
}

:deep(.orders-group-dialog .el-collapse-item) {
  margin-bottom: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe7f2;
  border-radius: 12px;
}

:deep(.orders-group-dialog .el-collapse-item__header) {
  height: 46px;
  padding: 0 16px;
  border-bottom-color: #edf2f8;
}

:deep(.orders-group-dialog .el-collapse-item__wrap) {
  border-bottom: 0;
}

:deep(.orders-group-dialog .el-collapse-item__content) {
  padding: 14px 16px 16px;
}

:deep(.orders-group-dialog .el-table) {
  --el-table-border-color: #dfe7f2;
  --el-table-header-bg-color: #f3f6fb;
  --el-table-header-text-color: #001b44;
  --el-table-text-color: #001b44;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-pager) {
    gap: 6px;
  }
}

@media (max-width: 1500px) {
  .designer-orders-card {
    grid-template-rows: 70px auto minmax(0, 1fr) 72px;
  }

  .orders-filter {
    grid-template-columns: repeat(3, 1fr);
    padding: 14px 22px;
  }

  .date-form-item {
    grid-column: span 2;
  }
}

@media (max-width: 900px) {
  .orders-filter {
    grid-template-columns: 1fr;
  }

  .date-form-item {
    grid-column: auto;
  }
}
</style>
