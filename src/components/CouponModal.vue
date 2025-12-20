<!--
==========================================
TypeScript 練習題目 - 優惠券彈窗組件
==========================================

🎯 練習目標：
1. 學習 Vue 3 組件的 TypeScript 用法
2. 理解 Props 和 Emits 的型別定義
3. 練習組合式 API 的整合使用

📝 練習說明：
請為以下 script setup 區塊加上正確的 TypeScript 型別註解
-->

<script setup lang="ts">
import { apiCreateCoupon, apiEditCoupon } from '@/api/coupon'
import { useCouponForm } from '@/composable/useCouponData'

import type { CouponData } from '@/types/coupon'
import { Modal } from 'bootstrap'

import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

interface CouponModalProps {
  coupon: CouponData | null
}

const { coupon } = defineProps<CouponModalProps>()

const emit = defineEmits<{ (e: 'get-coupons'): void }>()

const modalRef = useTemplateRef<HTMLElement>('modalRef')

let modal: Modal | null = null

onMounted(() => {
  if (modalRef.value) {
    modal = new Modal(modalRef.value)
  }
})

onUnmounted(() => {
  if (modal) {
    modal.dispose()
  }
})

const openModal = () => {
  if (modal) {
    modal.show()
  }
}

const closeModal = () => {
  if (modal) {
    modal.hide()
  }
}

const { form, formTitle, loadCoupon } = useCouponForm()

const dueDateFormatted = computed({
  get: () => {
    if (form.value.due_date) {
      // form.value.due_date 儲存為 Unix 秒數，轉為 ms
      const date = new Date(form.value.due_date * 1000)
      return date.toISOString().slice(0, 16)
    }
    return ''
  },
  set: (value: string) => {
    // 儲存為 Unix 秒數
    form.value.due_date = Math.floor(new Date(value).getTime() / 1000)
  },
})

watch(
  () => coupon,
  (newCoupon) => {
    if (newCoupon && newCoupon.id) {
      loadCoupon(newCoupon)
    } else {
      loadCoupon(null)
    }
  },
  { immediate: true, deep: true },
)

const isEditMode = computed(() => Boolean(coupon?.id))

const isLoading = ref(false)

const saveCoupon = async (): Promise<void> => {
  const { id, ...couponData } = form.value

  isLoading.value = true

  try {
    if (isEditMode.value && id) {
      await apiEditCoupon({ data: couponData, id })
    } else {
      await apiCreateCoupon(couponData)
    }
    closeModal()
  } catch {
    alert('新增/編輯優惠券失敗')
  } finally {
    isLoading.value = false
    emit('get-coupons')
  }
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    id="addNewCouponModal"
    tabindex="-1"
    aria-labelledby="addNewCouponModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-lg">
        <div class="modal-header">
          <h5 class="modal-title" id="addNewCouponModalLabel">{{ formTitle }}</h5>
          <button
            @click="closeModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label for="couponTitle" class="form-label">優惠券名稱</label>
              <input
                v-model="form.title"
                type="text"
                class="form-control rounded-lg"
                id="couponTitle"
              />
            </div>
            <div class="mb-3">
              <label for="couponCode" class="form-label">優惠券代碼</label>
              <input
                v-model="form.code"
                type="text"
                class="form-control rounded-lg"
                id="couponCode"
              />
            </div>
            <div class="mb-3">
              <label for="couponPercent" class="form-label">折扣百分比</label>
              <input
                v-model="form.percent"
                type="number"
                class="form-control rounded-lg"
                id="couponPercent"
                min="0"
                max="100"
              />
            </div>
            <div class="mb-3">
              <label for="couponDueDate" class="form-label">到期日</label>
              <input
                v-model="dueDateFormatted"
                type="datetime-local"
                class="form-control rounded-lg"
                id="couponDueDate"
              />
            </div>
            <div class="mb-3">
              <label for="couponNum" class="form-label">使用次數</label>
              <input
                v-model="form.num"
                type="number"
                class="form-control rounded-lg"
                id="couponNum"
                min="0"
              />
            </div>
            <div class="mb-3 d-flex align-items-center">
              <label class="form-label me-3 mb-0">啟用</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_enabled"
                  class="form-check-input"
                  type="checkbox"
                  :true-value="1"
                  :false-value="0"
                  id="flexSwitchCouponEnable"
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" type="button" class="btn btn-outline-secondary rounded-lg">
            取消
          </button>
          <button
            @click="saveCoupon"
            :disabled="isLoading"
            type="button"
            class="btn btn-dark rounded-lg"
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
