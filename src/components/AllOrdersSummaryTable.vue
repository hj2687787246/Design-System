<template>
  <div class="orders-table-body">
    <div class="orders-table-scroll-region">
      <el-table ref="tableRef" v-loading="loading" :data="orders" :row-key="getAllOrderSummarySelectionKey" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border height="100%" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" reserve-selection width="52" fixed="left" />
      <el-table-column align="center" label="序号" width="58" prop="index" fixed="left" />
      <el-table-column label="商家名称" prop="merchant" />
      <el-table-column label="订单数量" prop="orderCount" />
      <el-table-column label="照片张数" prop="photoCount" />
      <el-table-column label="接单总价">
        <template #default="{ row }: { row: AllOrderSummary }">{{ formatOrderStatNumber(row.receiveTotal) }}</template>
      </el-table-column>
      <el-table-column label="派单总价">
        <template #default="{ row }: { row: AllOrderSummary }">{{ formatOrderStatNumber(row.dispatchTotal) }}</template>
      </el-table-column>
      <el-table-column label="利润">
        <template #default="{ row }: { row: AllOrderSummary }">{{ formatOrderStatNumber(row.profit) }}</template>
      </el-table-column>
      <el-table-column label="订单时间" prop="orderedAt" />
    </el-table>
    </div>

    <div v-if="hasSelectedOrders" class="selection-summary-bar is-visible">
      <span class="selection-summary-check" aria-hidden="true">✓</span>
      <span class="selection-summary-count">{{ selectedCountText }}</span>
      <span class="selection-summary-metric">订单数量 <strong>{{ formatOrderStatNumber(selectedStatValues.orderCount) }}</strong></span>
      <span class="selection-summary-metric">照片张数 <strong>{{ formatOrderStatNumber(selectedStatValues.photoCount) }}</strong></span>
      <span class="selection-summary-metric">接单总价 <strong>¥{{ formatOrderStatNumber(selectedStatValues.receiveTotal) }}</strong></span>
      <span class="selection-summary-metric">派单总价 <strong>¥{{ formatOrderStatNumber(selectedStatValues.dispatchTotal) }}</strong></span>
      <span class="selection-summary-metric">利润 <strong>¥{{ formatOrderStatNumber(selectedStatValues.profit) }}</strong></span>
      <el-button class="clear-selection-button" plain size="small" @click="clearSelection">清空选择</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableInstance } from 'element-plus'
import type { AllOrderSummary } from '../types/AllOrders'
import { getAllOrderSummarySelectionKey } from '../utils/allOrdersSelection'
import { createSummaryStatValues, formatOrderStatNumber } from '../utils/allOrdersStats'

const props = defineProps<{
  orders: AllOrderSummary[]
  selectedOrders: AllOrderSummary[]
  loading?: boolean
}>()

const tableRef = ref<TableInstance>()
const hasSelectedOrders = computed(() => props.selectedOrders.length > 0)
const selectedStatValues = computed(() => createSummaryStatValues(props.selectedOrders))
const selectedCountText = computed(() => `已选 ${formatOrderStatNumber(props.selectedOrders.length)} 条`)

const emit = defineEmits<{
  (event: 'selection-change', selection: AllOrderSummary[]): void
  (event: 'clear-selection'): void
}>()

const handleSelectionChange = (selection: AllOrderSummary[]) => {
  emit('selection-change', selection)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
  emit('clear-selection')
}
</script>

<style scoped lang="scss">
.orders-table-body {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.orders-table-scroll-region {
  flex: 1 1 auto;
  min-height: 0;
  transition: min-height 0.26s ease;
}

.selection-summary-bar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 26px;
  height: 0;
  max-height: 0;
  margin-top: 0;
  padding: 0 18px;
  overflow: hidden;
  color: #fff;
  border: 1px solid transparent;
  border-radius: 8px;
  opacity: 0;
  transform: translateY(8px);
  background: linear-gradient(135deg, #078f86 0%, #007f7a 52%, #00746f 100%);
  box-shadow: 0 12px 26px rgba(0, 114, 108, 0);
  transition:
    height 0.26s ease,
    max-height 0.26s ease,
    margin 0.26s ease,
    padding 0.26s ease,
    border-color 0.26s ease,
    opacity 0.22s ease,
    transform 0.26s ease,
    box-shadow 0.26s ease;

  &.is-visible {
    height: 40px;
    max-height: 40px;
    margin-top: 10px;
    border-color: rgba(255, 255, 255, 0.18);
    opacity: 1;
    transform: translateY(0);
    box-shadow: 0 12px 26px rgba(0, 114, 108, 0.18);
  }
}

.selection-summary-check {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  color: #008b83;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  background: #dff8f4;
  border-radius: 50%;
}

.selection-summary-count,
.selection-summary-metric {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.selection-summary-count {
  margin-left: -16px;
}

.selection-summary-metric strong {
  margin-left: 6px;
  color: #fff;
  font-size: 15px;
  font-weight: 900;
}

.clear-selection-button {
  width: 78px;
  height: 28px;
  padding: 0;
  margin-left: auto;
  color: #e9fffb;
  font-size: 13px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.58);
  border-radius: 4px;

  &:hover,
  &:focus {
    color: #fff;
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.82);
  }
}
</style>
