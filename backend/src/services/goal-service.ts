import type { CreateGoalInput, Goal, UpdateGoalInput } from '../domain/entities/goal'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { GoalRepository } from '../domain/repositories/goal-repository'

const VALID_TYPES = ['steps', 'calories', 'water', 'sleep', 'weight'] as const
const VALID_STATUSES = ['active', 'completed', 'paused'] as const

export class GoalService {
  constructor(private readonly goalRepository: GoalRepository) {}

  async listGoals(): Promise<Goal[]> {
    return this.goalRepository.findAll()
  }

  async getGoal(id: string): Promise<Goal> {
    const goal = await this.goalRepository.findById(id)
    if (!goal) throw new NotFoundError('Goal')
    return goal
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    return this.goalRepository.findByUserId(userId)
  }

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    if (!input.userId?.trim()) throw new ValidationError('userId is required')
    if (!input.title?.trim()) throw new ValidationError('title is required')
    if (!VALID_TYPES.includes(input.type)) throw new ValidationError(`type must be one of: ${VALID_TYPES.join(', ')}`)
    if (input.targetValue <= 0) throw new ValidationError('targetValue must be > 0')
    if (!input.unit?.trim()) throw new ValidationError('unit is required')
    if (!this.isValidDate(input.deadline)) throw new ValidationError('deadline must be YYYY-MM-DD')

    return this.goalRepository.create(input)
  }

  async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
    if (Object.keys(input).length === 0) throw new ValidationError('No fields to update')
    if (input.targetValue !== undefined && input.targetValue <= 0) throw new ValidationError('targetValue must be > 0')
    if (input.currentValue !== undefined && input.currentValue < 0) throw new ValidationError('currentValue must be >= 0')
    if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}`)
    if (input.deadline !== undefined && !this.isValidDate(input.deadline)) throw new ValidationError('deadline must be YYYY-MM-DD')

    const updated = await this.goalRepository.update(id, input)
    if (!updated) throw new NotFoundError('Goal')
    return updated
  }

  async deleteGoal(id: string): Promise<void> {
    const deleted = await this.goalRepository.delete(id)
    if (!deleted) throw new NotFoundError('Goal')
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date))
  }
}
