export type GoalType = 'steps' | 'calories' | 'water' | 'sleep' | 'weight'

export interface HealthLog {
  id: string
  userId: string
  date: string
  steps: number
  caloriesBurned: number
  waterMl: number
  sleepHours: number
  mood: number
  note: string | null
  createdAt: string
}

export interface CreateHealthLogBody {
  userId: string
  date: string
  steps: number
  caloriesBurned: number
  waterMl: number
  sleepHours: number
  mood: number
  note?: string
}

export interface UpdateHealthLogBody {
  steps?: number
  caloriesBurned?: number
  waterMl?: number
  sleepHours?: number
  mood?: number
  note?: string
}

export interface HealthLogListResponse {
  data: HealthLog[]
}

export interface HealthLogResponse {
  data: HealthLog
}
