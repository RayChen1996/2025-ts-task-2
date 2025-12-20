// 優惠券基本型別
export type CouponData = {
  id: string
  title: string
  code: string
  percent: number
  due_date: number
  // 使用 0/1 與後端一致
  is_enabled: number
  num: number
}

// 建立優惠券參數型別
export type CreateCouponParams = {
  title: string
  code: string
  percent: number
  due_date: number
  is_enabled: number
  num: number
}

// 編輯優惠券參數型別
export type EditCouponParams = {
  id: string
  data: CreateCouponParams
}

// 分頁資訊型別
export type Pagination = {
  total_pages: number
  current_page: number
  has_pre: boolean
  has_next: boolean
  category: string
}

// API 回應型別
export type GetCouponsResponse = {
  success: boolean
  coupons: CouponData[]
  pagination: Pagination
  messages: unknown[]
}

// 訊息回應型別
type MessageResponse = {
  success: boolean
  message: string
}

export type CreateCouponResponse = MessageResponse
export type EditCouponResponse = MessageResponse
export type DeleteCouponResponse = MessageResponse
