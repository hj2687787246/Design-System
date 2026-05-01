export interface MasterDataPagination {
  pageNo: number
  pageSize: number
}

export interface MasterDataFilters {
  merchantName: string
}

export type MerchantId = number | string

export interface MerchantPhotoType {
  id: MerchantId
  photoType: string
  acceptPrice: number | undefined
  dispatchPrice: number | undefined
}

export interface MerchantRecord {
  id: MerchantId
  merchantName: string
  photoTypes: MerchantPhotoType[]
  createdAt: string
}

export interface MerchantDialogForm {
  merchantName: string
  photoTypes: MerchantPhotoType[]
}
