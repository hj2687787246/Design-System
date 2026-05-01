<template>
  <section class="create-order-panel">
    <el-form
      v-if="isEditMode"
      ref="singleFormRef"
      class="create-order-form"
      :model="singleForm"
      :rules="singleRules"
      label-position="left"
    >
      <el-form-item label="商家名称" prop="shopId">
        <el-select v-model="singleForm.shopId" filterable fit-input-width placeholder="请选择商家名称" popper-class="create-order-single-select-popper" @change="handleSingleShopChange">
          <el-option v-for="item in merchantOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="客户信息" prop="customerInfo">
        <el-input v-model.trim="singleForm.customerInfo" placeholder="请输入客户信息" />
      </el-form-item>

      <el-form-item label="照片类型" prop="photoType">
        <el-select v-model="singleForm.photoType" :disabled="!singleForm.shopId" :loading="isProductTypeLoading" filterable fit-input-width placeholder="请选择照片类型" popper-class="create-order-single-select-popper" @change="handleSinglePhotoTypeChange">
          <el-option v-for="item in photoTypeOptions" :key="item.id ?? item.typeName" :label="item.typeName" :value="item.typeName" />
        </el-select>
      </el-form-item>

      <el-form-item label="照片张数" prop="photoCount">
        <el-input-number v-model="singleForm.photoCount" :min="1" :precision="0" :step="1" placeholder="请输入照片张数" />
      </el-form-item>

      <el-form-item label="接单价" prop="acceptUnitPrice">
        <el-input-number
          v-model="singleForm.acceptUnitPrice"
          :min="0"
          :precision="PRICE_DECIMAL_PLACES"
          :step="1"
          disabled-scientific
          inputmode="decimal"
          placeholder="请输入接单价"
          @change="singleForm.acceptUnitPrice = normalizePriceNumber($event)"
          @input.capture="enforcePriceInput"
          @paste.capture="preventInvalidPricePaste"
        />
      </el-form-item>

      <el-form-item label="派单价" prop="dispatchUnitPrice">
        <el-input-number
          v-model="singleForm.dispatchUnitPrice"
          :min="0"
          :precision="PRICE_DECIMAL_PLACES"
          :step="1"
          disabled-scientific
          inputmode="decimal"
          placeholder="请输入派单价"
          @change="singleForm.dispatchUnitPrice = normalizePriceNumber($event)"
          @input.capture="enforcePriceInput"
          @paste.capture="preventInvalidPricePaste"
        />
      </el-form-item>

      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model.trim="singleForm.orderNo" placeholder="请输入订单号" />
      </el-form-item>

      <el-form-item label="下单时间" prop="orderedAt">
        <el-date-picker v-model="singleForm.orderedAt" format="YYYY-MM-DD HH:mm:ss" placeholder="请选择下单时间" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>

      <el-form-item class="remark-form-item" label="备注">
        <el-input v-model="singleForm.remark" placeholder="请输入备注" resize="none" type="textarea" />
      </el-form-item>
    </el-form>

    <el-form v-else ref="batchFormRef" class="batch-order-form" :model="batchForm" :rules="batchRules" label-position="top">
      <div class="order-config-card">
        <div class="order-config-copy">
          <span class="order-config-title-icon">
            <el-icon><Document /></el-icon>
          </span>
          <div class="order-config-text">
            <strong>批量建单配置</strong>
            <span>先选择商家和照片类型，再新增下方订单明细</span>
          </div>
        </div>

        <div class="batch-common-fields">
          <el-form-item label="商家名称" prop="shopId">
            <el-select v-model="batchForm.shopId" filterable fit-input-width placeholder="请选择商家名称" popper-class="create-order-batch-merchant-popper" @change="handleBatchShopChange">
              <el-option v-for="item in merchantOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="照片类型" prop="photoType">
            <el-select
              v-model="batchForm.photoType"
              :disabled="!batchForm.shopId"
              :loading="isProductTypeLoading"
              filterable
              fit-input-width
              placeholder="请选择照片类型"
              popper-class="create-order-batch-photo-type-popper"
              @change="handleBatchPhotoTypeChange"
            >
              <el-option v-for="item in photoTypeOptions" :key="item.id ?? item.typeName" :label="item.typeName" :value="item.typeName" />
            </el-select>
          </el-form-item>

          <el-button class="inline-add-row-button" native-type="button" type="primary" plain :disabled="!canAddBatchRow" @click="addBatchRow">新增明细</el-button>
        </div>
      </div>

      <el-alert v-if="importBlockingMessage" class="import-alert" :closable="false" show-icon type="error" :title="importBlockingMessage" />
      <el-alert v-else-if="importErrors.length" class="import-alert" :closable="false" show-icon type="error" title="导入数据存在错误，请修改 Excel 后重新上传。" />

      <el-table class="batch-order-table" :data="batchForm.rows" row-key="rowKey" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border height="400">
        <el-table-column label="序号" type="index" width="54" fixed />

        <el-table-column label="客户信息" min-width="180">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'customerInfo')" :prop="`rows.${$index}.customerInfo`" :rules="textRequiredRule('请输入客户信息')">
              <el-input v-model.trim="row.customerInfo" />
              <div v-for="error in getFieldErrors($index, 'customerInfo')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="照片张数" width="136">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'photoCount')" :prop="`rows.${$index}.photoCount`" :rules="requiredRule('请输入照片张数')">
              <el-input-number v-model="row.photoCount" controls-position="right" :min="1" :precision="0" :step="1" />
              <div v-for="error in getFieldErrors($index, 'photoCount')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="接单价" width="136">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'acceptUnitPrice')" :prop="`rows.${$index}.acceptUnitPrice`" :rules="requiredRule('请输入接单价')">
              <el-input-number
                v-model="row.acceptUnitPrice"
                controls-position="right"
                :min="0"
                :precision="PRICE_DECIMAL_PLACES"
                :step="1"
                disabled-scientific
                inputmode="decimal"
                @change="row.acceptUnitPrice = normalizePriceNumber($event)"
                @input.capture="enforcePriceInput"
                @paste.capture="preventInvalidPricePaste"
              />
              <div v-for="error in getFieldErrors($index, 'acceptUnitPrice')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="派单价" width="136">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'dispatchUnitPrice')" :prop="`rows.${$index}.dispatchUnitPrice`" :rules="requiredRule('请输入派单价')">
              <el-input-number
                v-model="row.dispatchUnitPrice"
                controls-position="right"
                :min="0"
                :precision="PRICE_DECIMAL_PLACES"
                :step="1"
                disabled-scientific
                inputmode="decimal"
                @change="row.dispatchUnitPrice = normalizePriceNumber($event)"
                @input.capture="enforcePriceInput"
                @paste.capture="preventInvalidPricePaste"
              />
              <div v-for="error in getFieldErrors($index, 'dispatchUnitPrice')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="订单号" min-width="180">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'orderNo')" :prop="`rows.${$index}.orderNo`" :rules="textRequiredRule('请输入订单号')">
              <el-input v-model.trim="row.orderNo" />
              <div v-for="error in getFieldErrors($index, 'orderNo')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="下单时间" width="218">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'orderedAt')" :prop="`rows.${$index}.orderedAt`" :rules="requiredRule('请选择下单时间')">
              <el-date-picker v-model="row.orderedAt" format="YYYY-MM-DD HH:mm:ss" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
              <div v-for="error in getFieldErrors($index, 'orderedAt')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="180">
          <template #default="{ row, $index }: { row: BatchOrderRow; $index: number }">
            <el-form-item :class="getFieldClass($index, 'remark')">
              <el-input v-model="row.remark" />
              <div v-for="error in getFieldErrors($index, 'remark')" :key="error" class="field-error-tip">{{ error }}</div>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column class-name="operation-column-cell" fixed="right" label="操作" width="82">
          <template #default="{ $index }: { $index: number }">
            <div class="batch-row-action">
              <el-button native-type="button" plain size="small" type="danger" @click="removeBatchRow($index)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getMerchantMasterDetailApi } from '../api/merchantMaster'
import type { AdminOrderImportPreviewVO } from '../api/adminOrders'
import type {
  CreateOrderBatchRow,
  CreateOrderBatchSubmit,
  CreateOrderForm,
  CreateOrderImportError,
  CreateOrderMerchantOption,
} from '../types/CreateOrder'
import type { OrderId } from '../types/AllOrders'
import { enforcePriceInput, normalizePriceNumber, PRICE_DECIMAL_PLACES, preventInvalidPricePaste } from '../utils/price'

type CreateOrderMode = 'create' | 'edit'
type BatchOrderRow = CreateOrderBatchRow

interface PhotoTypeOption {
  id?: OrderId
  typeName: string
  defaultAcceptPrice?: string | number
  defaultDispatchPrice?: string | number
}

const props = withDefaults(defineProps<{
  mode?: CreateOrderMode
  initialForm?: Partial<CreateOrderForm>
  importPreview?: AdminOrderImportPreviewVO | null
  merchantOptions: CreateOrderMerchantOption[]
}>(), {
  mode: 'create',
  importPreview: null,
})

const emit = defineEmits<{
  confirm: [form: CreateOrderForm | CreateOrderBatchSubmit]
  submitDisabledChange: [disabled: boolean]
}>()

const singleFormRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const photoTypeOptions = ref<PhotoTypeOption[]>([])
const isProductTypeLoading = ref(false)
const importErrors = ref<CreateOrderImportError[]>([])
const importBlockingMessage = ref('')
const lastBatchPhotoType = ref('')

const isEditMode = computed(() => props.mode === 'edit')

const createRowKey = () => `row-${Date.now()}-${Math.random().toString(16).slice(2)}`

const getEmptySingleForm = (): CreateOrderForm => ({
  merchantName: '',
  shopId: undefined,
  productTypeId: undefined,
  customerInfo: '',
  photoType: '',
  photoCount: undefined,
  acceptUnitPrice: undefined,
  dispatchUnitPrice: undefined,
  orderNo: '',
  orderedAt: '',
  status: '',
  remark: '',
})

const createBatchRow = (source: Partial<CreateOrderBatchRow> = {}): BatchOrderRow => ({
  rowKey: source.rowKey ?? createRowKey(),
  excelRowNumber: source.excelRowNumber,
  merchantName: source.merchantName,
  photoType: source.photoType,
  customerInfo: source.customerInfo ?? '',
  photoCount: toOptionalNumber(source.photoCount),
  acceptUnitPrice: normalizePriceNumber(source.acceptUnitPrice),
  dispatchUnitPrice: normalizePriceNumber(source.dispatchUnitPrice),
  orderNo: source.orderNo ?? '',
  orderedAt: source.orderedAt ?? '',
  remark: source.remark ?? '',
})

const singleForm = reactive<CreateOrderForm>(getEmptySingleForm())
const batchForm = reactive({
  merchantName: '',
  shopId: undefined as OrderId | undefined,
  photoType: '',
  productTypeId: undefined as OrderId | undefined,
  rows: [] as BatchOrderRow[],
})

const canAddBatchRow = computed(() => Boolean(batchForm.shopId && batchForm.photoType))
const isSubmitDisabled = computed(() => !isEditMode.value && (Boolean(importBlockingMessage.value) || importErrors.value.length > 0 || batchForm.rows.length === 0))

const requiredRule = (message: string) => [{ required: true, message, trigger: 'change' }]
const textRequiredRule = (message: string) => [{ required: true, whitespace: true, message, trigger: 'blur' }]

const singleRules = reactive<FormRules<CreateOrderForm>>({
  shopId: requiredRule('请选择商家名称'),
  customerInfo: textRequiredRule('请输入客户信息'),
  photoType: requiredRule('请选择照片类型'),
  photoCount: requiredRule('请输入照片张数'),
  acceptUnitPrice: requiredRule('请输入接单价'),
  dispatchUnitPrice: requiredRule('请输入派单价'),
  orderNo: textRequiredRule('请输入订单号'),
  orderedAt: requiredRule('请输入下单时间'),
})

const batchRules = reactive<FormRules>({
  shopId: requiredRule('请选择商家名称'),
  photoType: requiredRule('请选择照片类型'),
})

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined

  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : undefined
}

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback
}

const matchMerchantByName = (name: string | undefined) => props.merchantOptions.find(item => item.name === name)

const selectedPhotoType = computed(() => photoTypeOptions.value.find(item => item.typeName === batchForm.photoType))

const loadPhotoTypes = async (shopId: OrderId | undefined) => {
  const apiShopId = Number(shopId)
  if (!Number.isFinite(apiShopId)) {
    photoTypeOptions.value = []
    return
  }

  isProductTypeLoading.value = true

  try {
    const merchantDetail = await getMerchantMasterDetailApi(apiShopId)
    photoTypeOptions.value = (merchantDetail.photoTypes ?? []).map(item => ({
      id: item.id,
      typeName: item.photoType,
      defaultAcceptPrice: item.acceptPrice ?? item.defaultAcceptPrice,
      defaultDispatchPrice: item.dispatchPrice ?? item.defaultDispatchPrice,
    }))
  } catch (error) {
    photoTypeOptions.value = []
    ElMessage.error(getErrorMessage(error, '照片类型列表加载失败'))
  } finally {
    isProductTypeLoading.value = false
  }
}

const fillRowDefaultPrices = (row: BatchOrderRow, photoType: PhotoTypeOption | undefined = selectedPhotoType.value) => {
  row.acceptUnitPrice = normalizePriceNumber(photoType?.defaultAcceptPrice)
  row.dispatchUnitPrice = normalizePriceNumber(photoType?.defaultDispatchPrice)
}

const fillAllRowDefaultPrices = () => {
  batchForm.rows.forEach(row => fillRowDefaultPrices(row))
}

const resetBatchForm = () => {
  batchForm.merchantName = ''
  batchForm.shopId = undefined
  batchForm.photoType = ''
  batchForm.productTypeId = undefined
  batchForm.rows = []
  photoTypeOptions.value = []
  importErrors.value = []
  importBlockingMessage.value = ''
  lastBatchPhotoType.value = ''
}

const handleSingleShopChange = async (shopId: OrderId) => {
  const selectedMerchant = props.merchantOptions.find(item => item.id === shopId)
  singleForm.merchantName = selectedMerchant?.name ?? ''
  singleForm.photoType = ''
  singleForm.productTypeId = undefined
  singleForm.acceptUnitPrice = undefined
  singleForm.dispatchUnitPrice = undefined
  await loadPhotoTypes(shopId)
  singleFormRef.value?.clearValidate(['photoType', 'acceptUnitPrice', 'dispatchUnitPrice'])
}

const handleSinglePhotoTypeChange = (photoTypeName: string) => {
  const photoType = photoTypeOptions.value.find(item => item.typeName === photoTypeName)
  if (!photoType) return

  singleForm.productTypeId = photoType.id
  singleForm.acceptUnitPrice = normalizePriceNumber(photoType.defaultAcceptPrice)
  singleForm.dispatchUnitPrice = normalizePriceNumber(photoType.defaultDispatchPrice)
}

const handleBatchShopChange = async (shopId: OrderId) => {
  const selectedMerchant = props.merchantOptions.find(item => item.id === shopId)
  batchForm.merchantName = selectedMerchant?.name ?? ''
  batchForm.photoType = ''
  batchForm.productTypeId = undefined
  batchForm.rows = []
  lastBatchPhotoType.value = ''
  await loadPhotoTypes(shopId)
  batchFormRef.value?.clearValidate(['photoType'])
}

const handleBatchPhotoTypeChange = async (photoTypeName: string) => {
  const photoType = photoTypeOptions.value.find(item => item.typeName === photoTypeName)
  batchForm.productTypeId = photoType?.id

  if (!photoType) return

  if (!batchForm.rows.length) {
    addBatchRow()
    lastBatchPhotoType.value = photoTypeName
    return
  }

  if (!lastBatchPhotoType.value) {
    fillAllRowDefaultPrices()
    lastBatchPhotoType.value = photoTypeName
    return
  }

  try {
    await ElMessageBox.confirm('切换照片类型后，是否用该类型的默认接单价和默认派单价覆盖全部订单行？', '覆盖价格确认', {
      confirmButtonText: '覆盖',
      cancelButtonText: '不覆盖',
      type: 'warning',
    })
    fillAllRowDefaultPrices()
  } catch {
    // 用户选择不覆盖时保留当前行价格。
  } finally {
    lastBatchPhotoType.value = photoTypeName
  }
}

const addBatchRow = () => {
  if (!canAddBatchRow.value) return

  const row = createBatchRow()
  fillRowDefaultPrices(row)
  batchForm.rows.push(row)
}

const removeBatchRow = (index: number) => {
  batchForm.rows.splice(index, 1)
  ElMessage({
    type: 'success',
    message: '删除成功!',
  })
}

const normalizePreviewRow = (row: Record<string, unknown>): BatchOrderRow => createBatchRow({
  excelRowNumber: toOptionalNumber(row.excelRowNumber),
  merchantName: typeof row.merchantName === 'string' ? row.merchantName : '',
  photoType: typeof row.photoType === 'string' ? row.photoType : '',
  orderNo: typeof row.orderNo === 'string' ? row.orderNo : '',
  customerInfo: typeof row.customerInfo === 'string' ? row.customerInfo : '',
  photoCount: toOptionalNumber(row.photoCount),
  acceptUnitPrice: normalizePriceNumber(row.acceptUnitPrice),
  dispatchUnitPrice: normalizePriceNumber(row.dispatchUnitPrice),
  orderedAt: typeof row.orderedAt === 'string' ? row.orderedAt : '',
  remark: typeof row.remark === 'string' ? row.remark : '',
})

const uniqueFilledValues = (values: Array<string | undefined>) => Array.from(new Set(values.map(item => item?.trim()).filter((item): item is string => Boolean(item))))

const applyImportPreview = async (preview: AdminOrderImportPreviewVO | null | undefined) => {
  if (!preview) return

  resetBatchForm()
  batchForm.rows = preview.rows.map(row => normalizePreviewRow(row as unknown as Record<string, unknown>))

  importErrors.value = preview.errors ?? []
  importBlockingMessage.value = ''

  const merchantNames = uniqueFilledValues(batchForm.rows.map(row => row.merchantName))
  const photoTypes = uniqueFilledValues(batchForm.rows.map(row => row.photoType))

  if (merchantNames.length > 1 || photoTypes.length > 1) {
    importBlockingMessage.value = '导入文件中只能包含同一个商户和同一种照片类型，请修改 Excel 后重新上传。'
  }

  if (merchantNames.length === 1) {
    batchForm.merchantName = merchantNames[0]
    const matchedMerchant = matchMerchantByName(merchantNames[0])
    batchForm.shopId = matchedMerchant?.id

    if (matchedMerchant?.id !== undefined) {
      await loadPhotoTypes(matchedMerchant.id)
    }
  }

  if (photoTypes.length === 1) {
    batchForm.photoType = photoTypes[0]
    const matchedPhotoType = photoTypeOptions.value.find(item => item.typeName === photoTypes[0])
    batchForm.productTypeId = matchedPhotoType?.id
    lastBatchPhotoType.value = photoTypes[0]
  }

  await nextTick()
  batchFormRef.value?.clearValidate()
}

const getFieldErrors = (index: number, field: string) => {
  return importErrors.value
    .filter(error => error.index === index && error.field === field)
    .map(error => error.message)
}

const getFieldClass = (index: number, field: string) => ({
  'is-import-error': getFieldErrors(index, field).length > 0,
})

watch(
  () => props.initialForm,
  async (initialForm) => {
    if (!isEditMode.value) return

    Object.assign(singleForm, getEmptySingleForm(), initialForm)
    singleForm.acceptUnitPrice = normalizePriceNumber(singleForm.acceptUnitPrice)
    singleForm.dispatchUnitPrice = normalizePriceNumber(singleForm.dispatchUnitPrice)

    if (singleForm.shopId) {
      await loadPhotoTypes(singleForm.shopId)
    }

    await nextTick()
    singleFormRef.value?.clearValidate()
  },
  { deep: true, immediate: true },
)

watch(
  () => props.importPreview,
  async (preview) => {
    if (isEditMode.value) return

    if (preview) {
      await applyImportPreview(preview)
    } else {
      resetBatchForm()
      await nextTick()
      batchFormRef.value?.clearValidate()
    }
  },
  { deep: true, immediate: true },
)

watch(isSubmitDisabled, disabled => emit('submitDisabledChange', disabled), { immediate: true })

const submitSingle = async () => {
  if (!singleFormRef.value) return

  try {
    await singleFormRef.value.validate()
    emit('confirm', { ...singleForm })
  } catch {
    // Element Plus 会自动展示字段错误，这里保持弹窗不关闭。
  }
}

const submitBatch = async () => {
  if (!batchFormRef.value || isSubmitDisabled.value) return

  try {
    await batchFormRef.value.validate()
  } catch {
    return
  }

  emit('confirm', {
    merchantName: batchForm.merchantName,
    shopId: batchForm.shopId,
    photoType: batchForm.photoType,
    productTypeName: batchForm.photoType,
    productTypeId: batchForm.productTypeId,
    orders: batchForm.rows.map(row => ({ ...row })),
  })
}

const submit = () => {
  if (isEditMode.value) {
    void submitSingle()
  } else {
    void submitBatch()
  }
}

defineExpose({
  submit,
  isSubmitDisabled,
})
</script>

<style scoped lang="scss">
:global(.create-order-single-select-popper),
:global(.create-order-batch-merchant-popper),
:global(.create-order-batch-photo-type-popper) {
  z-index: 4000 !important;
}

:global(.create-order-batch-merchant-popper) {
  width: 300px !important;
  min-width: 300px !important;
}

:global(.create-order-batch-photo-type-popper) {
  width: 260px !important;
  min-width: 260px !important;
}

:global(.create-order-single-select-popper) {
  min-width: 341px !important;
}

.create-order-panel {
  min-height: 100%;
  color: #001b44;
  background: #fff;
}

.create-order-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  column-gap: 48px;
  row-gap: 16px;
  padding: 28px 34px 18px;

  :deep(.el-form-item) {
    align-items: center;
    margin: 0;
  }

  :deep(.el-form-item__label) {
    width: 78px;
    flex: 0 0 78px;
    height: 32px;
    padding-right: 16px;
    color: #001b44;
    font-size: 13px;
    font-weight: 600;
    line-height: 32px;
    white-space: nowrap;
  }
}

.batch-order-form {
  display: grid;
  gap: 14px;
  padding: 20px 22px 12px;
}

.order-config-card {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto;
  gap: 22px;
  align-items: end;
  padding: 16px 18px;
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.96), rgba(255, 255, 255, 0.98)),
    #f8fbff;
  border: 1px solid #dbe7f5;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 27, 68, 0.06);
}

.order-config-copy {
  display: flex;
  align-items: center;
  gap: 16px;
  align-self: center;
}

.order-config-text {
  display: grid;
  gap: 9px;

  strong {
    color: #0f213f;
    font-size: 19px;
    font-weight: 800;
    line-height: 22px;
  }

  span {
    color: #8f98a8;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
  }
}

.order-config-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  color: #1684ff;
  background: #e8f1ff;
  border-radius: 50%;

  .el-icon {
    font-size: 25px;
  }
}

.batch-common-fields {
  display: grid;
  grid-template-columns: 300px 260px 92px;
  gap: 12px;
  align-items: end;

  :deep(.el-form-item) {
    margin: 0;
  }

  :deep(.el-form-item__label) {
    color: #435674;
    font-size: 12px;
    font-weight: 700;
    line-height: 18px;
    padding-bottom: 5px;
  }
}

.inline-add-row-button {
  width: 92px;
  height: 34px;
  padding: 0;
  font-weight: 800;
}

.import-alert {
  margin-top: -2px;
}

.batch-order-table {
  height: 420px;

  :deep(.el-table__cell) {
    padding: 8px 0;
  }

  :deep(.el-table__cell) {
    vertical-align: top;
  }

  :deep(.el-form-item) {
    margin: 0;
  }

  :deep(.el-form-item__content) {
    align-items: flex-start;
    line-height: 34px;
  }

  :deep(.el-form-item__error) {
    position: static;
    width: 100%;
    margin-top: 4px;
    padding-top: 0;
    line-height: 15px;
  }

  :deep(.el-date-editor.el-input) {
    height: 34px;
    line-height: 34px;
  }

  :deep(.el-date-editor .el-input__wrapper) {
    min-height: 34px;
    height: 34px;
    box-shadow: 0 0 0 1px #d7e3f3 inset;
  }

  :deep(.el-date-editor .el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #b9c9df inset;
  }
}

.field-error-tip {
  width: 100%;
  margin-top: 4px;
  color: #f56c6c;
  font-size: 12px;
  line-height: 15px;
}

.batch-row-action {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 34px;
}

.batch-order-table {
  :deep(.operation-column-cell) {
    text-align: left !important;
  }
}

.create-order-form,
.batch-order-form,
.batch-order-table {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 2px;
    box-shadow: 0 0 0 1px #d7e3f3 inset;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-input-number),
  :deep(.el-date-editor) {
    width: 100%;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-input-number .el-input__wrapper) {
    min-height: 34px;
  }

  :deep(.el-input-number .el-input__inner) {
    text-align: left;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    color: #001b44;
    font-size: 13px;
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-textarea__inner::placeholder) {
    color: #b0c0d6;
  }
}

.batch-order-table {
  :deep(.el-form-item.is-import-error .el-input__wrapper),
  :deep(.el-form-item.is-import-error .el-input__wrapper:hover),
  :deep(.el-form-item.is-import-error .el-input__wrapper.is-focus),
  :deep(.el-form-item.is-import-error .el-select__wrapper),
  :deep(.el-form-item.is-import-error .el-select__wrapper:hover),
  :deep(.el-form-item.is-import-error .el-select__wrapper.is-focused),
  :deep(.el-form-item.is-import-error .el-textarea__inner),
  :deep(.el-form-item.is-import-error .el-textarea__inner:hover),
  :deep(.el-form-item.is-import-error .el-textarea__inner:focus) {
    box-shadow: 0 0 0 1px #f56c6c inset;
  }
}

.remark-form-item {
  grid-column: 1 / -1;

  :deep(.el-form-item__content) {
    align-self: stretch;
  }

  :deep(.el-textarea),
  :deep(.el-textarea__inner) {
    height: 92px;
  }
}

@media (max-width: 900px) {
  .create-order-form,
  .order-config-card,
  .batch-common-fields {
    grid-template-columns: 1fr;
  }

  .create-order-form {
    padding: 22px 18px;
  }
}
</style>
