import { defineStore } from 'pinia'
import { healthLogApi } from '@/apis/health-log-api'
import type { CreateHealthLogBody, HealthLog, UpdateHealthLogBody } from '@/models'

export const useHealthLogStore = defineStore('HealthLogStore', {
  state: () => ({
    logs: [] as HealthLog[],
    currentLog: null as HealthLog | null,
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    totalSteps: (state) => state.logs.reduce((sum, l) => sum + l.steps, 0),
    avgMood: (state) =>
      state.logs.length ? state.logs.reduce((sum, l) => sum + l.mood, 0) / state.logs.length : 0,
    avgSleepHours: (state) =>
      state.logs.length ? state.logs.reduce((sum, l) => sum + l.sleepHours, 0) / state.logs.length : 0,
  },
  actions: {
    async fetchAll() {
      this.isLoading = true
      this.error = null
      const res = await healthLogApi.list()
      if (res.ok) this.logs = res.data
      else this.error = res.error
      this.isLoading = false
    },

    async fetchByUser(userId: string) {
      this.isLoading = true
      this.error = null
      const res = await healthLogApi.listByUser(userId)
      if (res.ok) this.logs = res.data
      else this.error = res.error
      this.isLoading = false
    },

    async create(body: CreateHealthLogBody) {
      this.error = null
      const res = await healthLogApi.create(body)
      if (res.ok) this.logs = [res.data, ...this.logs]
      else this.error = res.error
      return res
    },

    async update(id: string, body: UpdateHealthLogBody) {
      this.error = null
      const res = await healthLogApi.update(id, body)
      if (res.ok) {
        const idx = this.logs.findIndex((l) => l.id === id)
        if (idx !== -1) this.logs[idx] = res.data
      } else {
        this.error = res.error
      }
      return res
    },

    async remove(id: string) {
      this.error = null
      const res = await healthLogApi.delete(id)
      if (res.ok) this.logs = this.logs.filter((l) => l.id !== id)
      return res
    },
  },
})
