export type GoalType = 'steps' | 'calories' | 'water' | 'sleep' | 'weight'
export type GoalStatus = 'active' | 'completed' | 'paused'

export interface Goal {
  id: string
  userId: string
  type: GoalType
  title: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  status: GoalStatus
  createdAt: string
}

export interface CreateGoalBody {
  userId: string
  type: GoalType
  title: string
  targetValue: number
  currentValue?: number
  unit: string
  deadline: string
}

export interface UpdateGoalBody {
  title?: string
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: string
  status?: GoalStatus
}

export interface GoalListResponse {
  data: Goal[]
}

export interface GoalResponse {
  data: Goal
}
