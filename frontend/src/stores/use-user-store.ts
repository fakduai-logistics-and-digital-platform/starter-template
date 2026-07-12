import { defineStore } from 'pinia'
import {
  getDummyUsers,
  getUsers,
  postUserLogin,
} from '@/apis/user-api'

import type {
  UserGetRequestParam,
  UserGetResponseData,
  UserLoggedInData,
  UserLoginRequestBody,
} from '@/models'

export const useUserStore = defineStore('UserStore', {
  state: () => ({
    loginUser: {} as UserLoginRequestBody,
    loggendInUser: {} as UserLoggedInData,
    errorLogin: '' as string | undefined,
    getUserParam: {} as UserGetRequestParam,
    dataUsers: {} as UserGetResponseData | undefined,
    errorGetUsers: '' as string | undefined,
    // DummyJSON API state
    dummyUsers: {} as UserGetResponseData | undefined,
    errorGetDummyUsers: '' as string | undefined,
  }),
  persist: true,
  actions: {
    async userLogin() {
      this.errorLogin = undefined
      const apiResponse = await postUserLogin(this.loginUser)
      if (apiResponse !== undefined) {
        if (apiResponse.ok === true) {
          this.loggendInUser = {
            email: this.loginUser.email,
            token: apiResponse.data,
          } as UserLoggedInData
        }
        else {
          this.errorLogin = apiResponse.error
        }
      }
    },
    async userGers() {
      const apiResponse = await getUsers(this.getUserParam, this.loggendInUser.token)
      if (apiResponse !== undefined) {
        if (apiResponse.ok === true)
          this.dataUsers = apiResponse.data as UserGetResponseData

        else
          this.errorGetUsers = apiResponse.error
      }
    },
    // DummyJSON API - Get Users
    async fetchDummyUsers(params?: UserGetRequestParam) {
      this.errorGetDummyUsers = undefined
      const apiResponse = await getDummyUsers(params)
      if (apiResponse !== undefined) {
        if (apiResponse.ok === true)
          this.dummyUsers = apiResponse.data as UserGetResponseData

        else
          this.errorGetDummyUsers = apiResponse.error
      }
    },
  },
})
