export interface HealthLog {
  id: string
  userId: string
  date: string          // YYYY-MM-DD
  steps: number
  caloriesBurned: number
  waterMl: number
  sleepHours: number
  mood: number          // 1–5
  note: string | null
  createdAt: string
}

export interface CreateHealthLogInput {
  userId: string
  date: string
  steps: number
  caloriesBurned: number
  waterMl: number
  sleepHours: number
  mood: number
  note?: string
}

export interface UpdateHealthLogInput {
  steps?: number
  caloriesBurned?: number
  waterMl?: number
  sleepHours?: number
  mood?: number
  note?: string
}
