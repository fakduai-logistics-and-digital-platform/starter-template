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
  deadline: string      // YYYY-MM-DD
  status: GoalStatus
  createdAt: string
}

export interface CreateGoalInput {
  userId: string
  type: GoalType
  title: string
  targetValue: number
  currentValue?: number
  unit: string
  deadline: string
}

export interface UpdateGoalInput {
  title?: string
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: string
  status?: GoalStatus
}
