import type { CreateGoalInput, Goal, GoalStatus, UpdateGoalInput } from '../entities/goal'

export interface GoalRepository {
  findAll(): Promise<Goal[]>
  findById(id: string): Promise<Goal | null>
  findByUserId(userId: string): Promise<Goal[]>
  findByUserIdAndStatus(userId: string, status: GoalStatus): Promise<Goal[]>
  create(input: CreateGoalInput): Promise<Goal>
  update(id: string, input: UpdateGoalInput): Promise<Goal | null>
  delete(id: string): Promise<boolean>
}
