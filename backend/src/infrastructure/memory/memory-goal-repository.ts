import type { CreateGoalInput, Goal, GoalStatus, UpdateGoalInput } from '../../domain/entities/goal'
import type { GoalRepository } from '../../domain/repositories/goal-repository'

export class MemoryGoalRepository implements GoalRepository {
  private readonly goals = new Map<string, Goal>()

  async findAll(): Promise<Goal[]> {
    return [...this.goals.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findById(id: string): Promise<Goal | null> {
    return this.goals.get(id) ?? null
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    return [...this.goals.values()]
      .filter((g) => g.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async findByUserIdAndStatus(userId: string, status: GoalStatus): Promise<Goal[]> {
    return [...this.goals.values()]
      .filter((g) => g.userId === userId && g.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async create(input: CreateGoalInput): Promise<Goal> {
    const goal: Goal = {
      id: crypto.randomUUID(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      targetValue: input.targetValue,
      currentValue: input.currentValue ?? 0,
      unit: input.unit,
      deadline: input.deadline,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    this.goals.set(goal.id, goal)
    return goal
  }

  async update(id: string, input: UpdateGoalInput): Promise<Goal | null> {
    const existing = this.goals.get(id)
    if (!existing) return null
    const updated: Goal = {
      ...existing,
      title: input.title ?? existing.title,
      targetValue: input.targetValue ?? existing.targetValue,
      currentValue: input.currentValue ?? existing.currentValue,
      unit: input.unit ?? existing.unit,
      deadline: input.deadline ?? existing.deadline,
      status: input.status ?? existing.status,
    }
    this.goals.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.goals.delete(id)
  }
}
