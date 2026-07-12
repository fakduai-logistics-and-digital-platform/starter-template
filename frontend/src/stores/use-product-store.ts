import { defineStore } from 'pinia'
import { getProducts } from '@/apis/product-api'

import type {
  ProductGetRequestParam,
  ProductGetResponseData,
} from '@/models'

export const useProductStore = defineStore('ProductStore', {
  state: () => ({
    products: {} as ProductGetResponseData | undefined,
    errorGetProducts: '' as string | undefined,
  }),
  persist: true,
  actions: {
    async fetchProducts(params?: ProductGetRequestParam) {
      this.errorGetProducts = undefined
      const apiResponse = await getProducts(params)
      if (apiResponse !== undefined) {
        if (apiResponse.ok === true)
          this.products = apiResponse.data as ProductGetResponseData

        else
          this.errorGetProducts = apiResponse.error
      }
    },
  },
})
