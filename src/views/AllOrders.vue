<template>
  <section class="all-orders-card">
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

      <el-form-item>
        <el-select v-model="filters.designers" multiple collapse-tags placeholder="设计师多选">
          <el-option v-for="item in designerOptions" :key="item" :label="item" :value="item" />
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
        />
      </el-form-item>

      <el-form-item>
        <el-input v-model="filters.keyword" placeholder="输入关键词" />
      </el-form-item>

      <el-form-item>
        <el-button class="query-button" type="primary">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="export-button" :disabled="!selectedOrders.length">导出数据</el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="summary-button" type="success">详情/汇总</el-button>
      </el-form-item>
    </el-form>

    <div class="table-panel">
      <el-table :data="orders" border height="100%" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="52" />
        <el-table-column align="center" label="序号" min-width="58" prop="index" />
        <el-table-column label="商家名称" min-width="120" prop="merchant" />
        <el-table-column label="照片类型" min-width="91" prop="photoType" />
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <span class="status-text">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设计师" min-width="80" prop="designer" />
        <el-table-column label="订单号" min-width="150" prop="orderNo" />
        <el-table-column label="照片张数" min-width="81" prop="photoCount" />
        <el-table-column label="接单价" min-width="90" prop="receivePrice" />
        <el-table-column label="接单合计" min-width="82" prop="receiveTotal" />
        <el-table-column label="派单价" min-width="90" prop="dispatchPrice" />
        <el-table-column label="派单合计" min-width="82" prop="dispatchTotal" />
        <el-table-column label="客户信息" min-width="91" prop="customer" />
        <el-table-column label="备注" min-width="300">
          <template #default="{ row }">
            <span class="remark-text">{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" min-width="200" prop="orderedAt" />
        <el-table-column label="操作" min-width="164" fixed="right">
          <template #default>
            <el-button link type="primary">详情</el-button>
            <el-button link type="primary">编辑</el-button>
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
        :total="168"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { AllOrder, AllOrdersFilters, AllOrdersPagination, AllOrderSourceRow } from '../types/AllOrders'

const filters = reactive<AllOrdersFilters>({
  merchants: [],
  photoTypes: [],
  statuses: [],
  designers: [],
  dateRange: [] as string[],
  keyword: '',
})

const pagination = reactive<AllOrdersPagination>({
  pageNo: 1,
  pageSize: 15,
})

const selectedOrders = ref<AllOrder[]>([])

const merchantOptions = ['云帆摄影', '木石电商', '星野婚礼', '青橙影像', '森白视觉', '北岸写真']
const photoTypeOptions = ['精修', '抠图', '调色', '排版', '证件照', '产品修图']
const statusOptions = ['未派单', '未完工', '待审核', '已完工', '问题件', '其他']
const designerOptions = ['林设计', '陈设计', '周设计', '王设计', '何设计', '赵设计']

const source: AllOrderSourceRow[] = [
  ['云帆摄影', '精修', '未派单', '林设计', 'DD20260425001', 8, 12, 8, '李小姐', '加急处理', '2026-04-10 09:10:00'],
  ['木石电商', '抠图', '未完工', '陈设计', 'DD20260425002', 11, 14, 9, '张先生', '保持肤色自然', '2026-04-11 09:11:00'],
  ['星野婚礼', '调色', '待审核', '周设计', 'DD20260425003', 14, 16, 10, '王女士', '按样片风格', '2026-04-12 09:12:00'],
  ['青橙影像', '排版', '已完工', '王设计', 'DD20260425004', 17, 18, 11, '赵先生', '客户待确认', '2026-04-13 09:13:00'],
  ['森白视觉', '证件照', '问题件', '何设计', 'DD20260425005', 20, 12, 8, '刘女士', '周末前交付', '2026-04-14 09:14:00'],
  ['北岸写真', '产品修图', '其他', '赵设计', 'DD20260425006', 23, 14, 9, '何先生', '加急处理', '2026-04-15 09:15:00'],
  ['拾光电商', '精修', '未派单', '林设计', 'DD20260425007', 26, 16, 10, '李小姐', '保持肤色自然', '2026-04-16 09:16:00'],
  ['鹿鸣影像', '抠图', '未完工', '陈设计', 'DD20260425008', 29, 18, 11, '张先生', '按样片风格', '2026-04-17 09:17:00'],
  ['云帆摄影', '调色', '待审核', '周设计', 'DD20260425009', 32, 12, 8, '王女士', '客户待确认', '2026-04-18 09:18:00'],
  ['木石电商', '排版', '已完工', '王设计', 'DD20260425010', 8, 14, 9, '赵先生', '周末前交付', '2026-04-19 09:19:00'],
  ['星野婚礼', '证件照', '问题件', '何设计', 'DD20260425011', 11, 16, 10, '刘女士', '加急处理', '2026-04-20 09:20:00'],
  ['青橙影像', '产品修图', '其他', '赵设计', 'DD20260425012', 14, 18, 11, '何先生', '保持肤色自然', '2026-04-21 09:21:00'],
  ['森白视觉', '精修', '未派单', '林设计', 'DD20260425013', 17, 12, 8, '李小姐', '按样片风格', '2026-04-22 09:22:00'],
  ['北岸写真', '抠图', '未完工', '陈设计', 'DD20260425014', 20, 14, 9, '张先生', '客户待确认', '2026-04-23 09:23:00'],
  ['拾光电商', '调色', '待审核', '周设计', 'DD20260425015', 23, 16, 10, '王女士', '周末前交付', '2026-04-24 09:24:00'],
  ['鹿鸣影像', '排版', '已完工', '王设计', 'DD20260425016', 26, 18, 11, '赵先生', '加急处理', '2026-04-25 09:25:00'],
  ['云帆摄影', '证件照', '问题件', '何设计', 'DD20260425017', 29, 12, 8, '刘女士', '保持肤色自然', '2026-04-10 09:26:00'],
]

const orders: AllOrder[] = source.map(
  ([merchant, photoType, status, designer, orderNo, photoCount, receivePrice, dispatchPrice, customer, remark, orderedAt], index) => ({
    index: index + 1,
    merchant,
    photoType,
    status,
    designer,
    orderNo,
    photoCount,
    receivePrice,
    receiveTotal: photoCount * receivePrice,
    dispatchPrice,
    dispatchTotal: photoCount * dispatchPrice,
    customer,
    remark,
    orderedAt,
  }),
)

const handleSelectionChange = (selection: AllOrder[]) => {
  selectedOrders.value = selection
}
</script>

<style scoped lang="scss">
.all-orders-card {
  display: grid;
  grid-template-rows: 56px 64px minmax(0, 1fr) 72px;
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
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }
}

.orders-filter {
  display: grid;
  grid-template-columns: 154px 154px 154px 154px minmax(245px, 306px) 184px 62px 84px 96px;
  gap: 10px;
  align-items: center;
  min-height: 0;
  padding: 0 22px;
  margin: 0;
  background: #f8fbff;
  border-bottom: 1px solid #dfe8f4;

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
.export-button,
.summary-button {
  height: 33px;
  padding: 0;
  font-weight: 800;
  border-radius: 8px;
}

.query-button {
  width: 62px;
}

.export-button {
  width: 84px;
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
  width: 96px;
  background: #1fc66a;
  border-color: #1fc66a;
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

.status-text,
.remark-text {
  color: #0057ff;
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
  .all-orders-card {
    grid-template-rows: 56px auto minmax(0, 1fr) 72px;
  }

  .orders-filter {
    grid-template-columns: repeat(4, minmax(140px, 1fr));
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
