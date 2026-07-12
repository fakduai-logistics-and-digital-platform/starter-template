import { defineStore } from 'pinia'
import { goalApi } from '@/apis/goal-api'
import type { CreateGoalBody, Goal, UpdateGoalBody } from '@/models'

export const useGoalStore = defineStore('GoalStore', {
  state: () => ({
    goals: [] as Goal[],
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    activeGoals: (state) => state.goals.filter((g) => g.status === 'active'),
    completedGoals: (state) => state.goals.filter((g) => g.status === 'completed'),
    goalProgress: (state) => (id: string) => {
      const goal = state.goals.find((g) => g.id === id)
      if (!goal || goal.targetValue === 0) return 0
      return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    },
  },
  actions: {
    async fetchAll() {
      this.isLoading = true
      this.error = null
      const res = await goalApi.list()
      if (res.ok) this.goals = res.data
      else this.error = res.error
      this.isLoading = false
    },

    async fetchByUser(userId: string) {
      this.isLoading = true
      this.error = null
      const res = await goalApi.listByUser(userId)
      if (res.ok) this.goals = res.data
      else this.error = res.error
      this.isLoading = false
    },

    async create(body: CreateGoalBody) {
      this.error = null
      const res = await goalApi.create(body)
      if (res.ok) this.goals = [res.data, ...this.goals]
      else this.error = res.error
      return res
    },

    async update(id: string, body: UpdateGoalBody) {
      this.error = null
      const res = await goalApi.update(id, body)
      if (res.ok) {
        const idx = this.goals.findIndex((g) => g.id === id)
        if (idx !== -1) this.goals[idx] = res.data
      } else {
        this.error = res.error
      }
      return res
    },

    async remove(id: string) {
      this.error = null
      const res = await goalApi.delete(id)
      if (res.ok) this.goals = this.goals.filter((g) => g.id !== id)
      return res
    },
  },
})
