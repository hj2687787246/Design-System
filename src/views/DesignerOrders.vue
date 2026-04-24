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
        />
      </el-form-item>

      <el-form-item>
        <el-input v-model="filters.keyword" placeholder="输入关键词" />
      </el-form-item>

      <el-form-item>
        <el-button class="query-button" type="primary">查询</el-button>
      </el-form-item>
    </el-form>

    <div class="table-panel">
      <el-table :data="orders" border height="100%" stripe>
        <el-table-column label="商家名称" min-width="210" prop="merchant" />
        <el-table-column label="照片类型" min-width="88" prop="photoType" />
        <el-table-column label="状态" min-width="88">
          <template #default="{ row }">
            <span :class="['status-text', row.statusClass]">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设计师" min-width="88" prop="designer" />
        <el-table-column label="订单号" min-width="260" prop="orderNo" />
        <el-table-column label="照片张数" min-width="88" prop="photoCount" />
        <el-table-column label="客户信息" min-width="88" prop="customer" />
        <el-table-column label="备注" min-width="240" prop="remark" />
        <el-table-column label="下单时间" min-width="270" prop="orderedAt" />
        <el-table-column label="操作" min-width="88">
          <template #default>
            <el-button link type="primary">完工</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <footer class="pagination">
      <el-pagination
        v-model:current-page="pagination.pageNo"
        :page-size="pagination.pageSize"
        :pager-count="5"
        :total="128"
        layout="total, prev, pager, next, jumper"
      />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type {
  DesignerOrder,
  DesignerOrdersFilters,
  DesignerOrdersPagination,
  DesignerOrderSourceRow,
} from '../types/DesignerOrders'

const filters = reactive<DesignerOrdersFilters>({
  merchants: [],
  photoTypes: [],
  statuses: [],
  dateRange: [],
  keyword: '',
})

const pagination = reactive<DesignerOrdersPagination>({
  pageNo: 1,
  pageSize: 17,
})

const merchantOptions = ['云帆摄影', '木石电商', '星野婚礼', '青橙影像', '森白视觉', '北岸写真']
const photoTypeOptions = ['精修', '抠图', '调色', '排版', '证件照', '产品修图']
const statusOptions = ['未派单', '未完工', '待审核', '已完工', '问题件', '其他']

const source: DesignerOrderSourceRow[] = [
  ['云帆摄影', '精修', '未派单', '林设计', 'DD20260425001', 8, '李小姐', '加急处理', '2026-04-10 09:10:00'],
  ['木石电商', '抠图', '未完工', '陈设计', 'DD20260425002', 11, '张先生', '保持肤色自然', '2026-04-11 09:11:00'],
  ['星野婚礼', '调色', '待审核', '周设计', 'DD20260425003', 14, '王女士', '按样片风格', '2026-04-12 09:12:00'],
  ['青橙影像', '排版', '已完工', '王设计', 'DD20260425004', 17, '赵先生', '客户待确认', '2026-04-13 09:13:00'],
  ['森白视觉', '证件照', '问题件', '何设计', 'DD20260425005', 20, '刘女士', '周末前交付', '2026-04-14 09:14:00'],
  ['北岸写真', '产品修图', '其他', '赵设计', 'DD20260425006', 23, '何先生', '加急处理', '2026-04-15 09:15:00'],
  ['拾光电商', '精修', '未派单', '林设计', 'DD20260425007', 26, '李小姐', '保持肤色自然', '2026-04-16 09:16:00'],
  ['鹿鸣影像', '抠图', '未完工', '陈设计', 'DD20260425008', 29, '张先生', '按样片风格', '2026-04-17 09:17:00'],
  ['云帆摄影', '调色', '待审核', '周设计', 'DD20260425009', 32, '王女士', '客户待确认', '2026-04-18 09:18:00'],
  ['木石电商', '排版', '已完工', '王设计', 'DD20260425010', 8, '赵先生', '周末前交付', '2026-04-19 09:19:00'],
  ['星野婚礼', '证件照', '问题件', '何设计', 'DD20260425011', 11, '刘女士', '加急处理', '2026-04-20 09:20:00'],
  ['青橙影像', '产品修图', '其他', '赵设计', 'DD20260425012', 14, '何先生', '保持肤色自然', '2026-04-21 09:21:00'],
  ['森白视觉', '精修', '未派单', '林设计', 'DD20260425013', 17, '李小姐', '按样片风格', '2026-04-22 09:22:00'],
  ['北岸写真', '抠图', '未完工', '陈设计', 'DD20260425014', 20, '张先生', '客户待确认', '2026-04-23 09:23:00'],
  ['拾光电商', '调色', '待审核', '周设计', 'DD20260425015', 23, '王女士', '周末前交付', '2026-04-24 09:24:00'],
  ['鹿鸣影像', '排版', '已完工', '王设计', 'DD20260425016', 26, '赵先生', '加急处理', '2026-04-10 09:25:00'],
  ['云帆摄影', '证件照', '问题件', '何设计', 'DD20260425017', 29, '刘女士', '保持肤色自然', '2026-04-11 09:26:00'],
  ['木石电商', '精修', '未派单', '林设计', 'DD20260425018', 31, '张先生', '保持肤色自然', '2026-04-12 09:27:00'],
  ['星野婚礼', '抠图', '未完工', '陈设计', 'DD20260425019', 34, '王女士', '按样片风格', '2026-04-13 09:28:00'],
  ['青橙影像', '调色', '待审核', '周设计', 'DD20260425020', 37, '赵先生', '客户待确认', '2026-04-14 09:29:00'],
]

const orders: DesignerOrder[] = source.map(
  ([merchant, photoType, status, designer, orderNo, photoCount, customer, remark, orderedAt]) => ({
    merchant,
    photoType,
    status,
    designer,
    orderNo,
    photoCount,
    customer,
    remark,
    orderedAt,
    statusClass: status === '未完工' || status === '已完工' ? 'blue' : '',
  }),
)
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
  grid-template-columns: 177px 177px 177px 532px 221px 62px;
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

.status-text {
  &.blue {
    color: #0057ff;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #526584;

  :deep(.el-pagination) {
    --el-pagination-button-color: #1d5de7;
    --el-pagination-hover-color: #1f5fe8;
    font-weight: 500;
  }

  :deep(.el-pager li),
  :deep(.btn-prev),
  :deep(.btn-next) {
    min-width: 34px;
    height: 31px;
    border: 1px solid #dbe5f4;
    border-radius: 9px;
  }

  :deep(.el-pager li.is-active) {
    color: #fff;
    background: #1f5fe8;
    border-color: #1f5fe8;
  }

  :deep(.el-pagination__goto),
  :deep(.el-pagination__classifier) {
    color: #526584;
  }

  :deep(.el-pagination__editor.el-input) {
    width: 50px;
  }

  :deep(.el-pagination__editor .el-input__wrapper) {
    height: 31px;
    box-shadow: 0 0 0 1px #dbe5f4 inset;
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
