<!--
==========================================
TypeScript 練習題目 - 優惠券管理頁面
==========================================

🎯 練習目標：
1. 學習 Vue 3 組合式 API 的 TypeScript 用法
2. 理解 Ref 和響應式資料的型別定義
3. 練習 async/await 函式的型別註解

📝 練習說明：
請為以下 script setup 區塊加上正確的 TypeScript 型別註解
-->

<script setup lang="ts">
import { apiDeleteCoupon, apiGetCoupons } from '@/api/coupon'

import DeleteModal from '@/components/DeleteModal.vue'
import CouponModal from '@/components/CouponModal.vue'

import type { Pagination, CouponData } from '@/types/coupon'
import { onMounted, ref, useTemplateRef, watch } from 'vue'

const couponModalRef = useTemplateRef<InstanceType<typeof CouponModal>>('couponModalRef')
const deleteModalRef = useTemplateRef<InstanceType<typeof DeleteModal>>('deleteModalRef')

const currentPage = ref<string>('1')

const coupons = ref<CouponData[]>([])

const pagination = ref<Pagination>({
  total_pages: 0,
  current_page: 0,
  has_pre: false,
  has_next: false,
  category: '',
})

const getCoupons = async (): Promise<void> => {
  try {
    const res = await apiGetCoupons({
      page: currentPage.value,
    })

    coupons.value = res.data.coupons
    pagination.value = res.data.pagination
  } catch {
    alert('取得優惠券列表失敗')
  }
}
onMounted(() => {
  getCoupons()
})

watch(currentPage, getCoupons)

const getInitialCouponData = (): CouponData => ({
  id: '',
  title: '',
  code: '',
  percent: 0,
  // 使用 Unix 秒數
  due_date: Math.floor(Date.now() / 1000),
  // 0/1 與後端一致
  is_enabled: 1,
  num: 0,
})

const tempCoupon = ref<CouponData>(getInitialCouponData())

const openModal = (coupon: CouponData | null = null): void => {
  if (coupon) {
    tempCoupon.value = { ...coupon }
  }

  couponModalRef.value?.openModal()
}

const openDeleteModal = (couponId: string): void => {
  deleteModalRef.value?.openModal(() => handleDeleteCoupon(couponId))
}

const handleDeleteCoupon = async (couponId: string): Promise<void> => {
  try {
    await apiDeleteCoupon(couponId)
  } catch {
    alert('刪除優惠券失敗')
  } finally {
    getCoupons()
  }
}
</script>

<template>
  <div class="d-flex justify-content-end align-items-center mb-4">
    <button @click="openModal(null)" type="button" class="btn btn-dark rounded-lg px-4 py-2">
      <i class="fas fa-plus me-2"></i>新增優惠券
    </button>
  </div>
  <div class="card shadow-sm rounded-lg flex-grow-1">
    <div class="card-body p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">優惠券名稱</th>
              <th scope="col">優惠券代碼</th>
              <th scope="col">折扣百分比</th>
              <th scope="col">到期日</th>
              <th scope="col">使用次數</th>
              <th scope="col" class="text-center">啟用</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon.id">
              <td>{{ coupon.title }}</td>
              <td>{{ coupon.code }}</td>
              <td>{{ coupon.percent }}%</td>
              <td>{{ new Date(coupon.due_date * 1000).toLocaleDateString() }}</td>
              <td>{{ coupon.num }}</td>
              <td class="text-center">
                <div
                  class="form-check form-switch d-flex justify-content-center align-items-center"
                >
                  <input
                    readonly
                    class="form-check-input"
                    style="pointer-events: none"
                    type="checkbox"
                    id="flexSwitchCheckDefault1"
                    :checked="Boolean(coupon.is_enabled)"
                  />
                </div>
              </td>
              <td class="text-nowrap">
                <button
                  @click="openModal(coupon)"
                  type="button"
                  class="btn btn-sm btn-outline-dark rounded-lg me-2"
                >
                  編輯
                </button>
                <button
                  @click="openDeleteModal(coupon.id)"
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-lg"
                >
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="d-flex justify-content-center mt-4">
        <ul class="pagination">
          <li class="page-item">
            <button
              @click="currentPage = String(Number(currentPage) - 1)"
              :disabled="!pagination?.has_pre"
              type="button"
              class="page-link"
              :class="{ disabled: !pagination?.has_pre }"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          <li v-for="pageNum in pagination?.total_pages" class="page-item">
            <button
              @click="currentPage = pageNum.toString()"
              :disabled="currentPage === pageNum.toString()"
              type="button"
              class="page-link"
              :class="{ active: currentPage === pageNum.toString() }"
            >
              {{ pageNum }}
            </button>
          </li>
          <li class="page-item">
            <button
              @click="currentPage = String(Number(currentPage) + 1)"
              :disabled="!pagination?.has_next"
              class="page-link"
              :class="{ disabled: !pagination?.has_next }"
              type="button"
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <CouponModal ref="couponModalRef" :coupon="tempCoupon" @get-coupons="getCoupons" />
  <DeleteModal ref="deleteModalRef" title="刪除優惠券" content="確定要刪除該優惠券嗎？" />
</template>

<style lang="scss" scoped></style>
