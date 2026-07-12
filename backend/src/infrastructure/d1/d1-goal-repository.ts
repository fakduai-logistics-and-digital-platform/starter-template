import type { CreateGoalInput, Goal, GoalStatus, UpdateGoalInput } from '../../domain/entities/goal'
import type { GoalRepository } from '../../domain/repositories/goal-repository'

interface GoalRow {
  id: string
  user_id: string
  type: string
  title: string
  target_value: number
  current_value: number
  unit: string
  deadline: string
  status: string
  created_at: string
}

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as Goal['type'],
    title: row.title,
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit,
    deadline: row.deadline,
    status: row.status as Goal['status'],
    createdAt: row.created_at,
  }
}

export class D1GoalRepository implements GoalRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Goal[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM goals ORDER BY created_at DESC')
      .all<GoalRow>()
    return results.map(toGoal)
  }

  async findById(id: string): Promise<Goal | null> {
    const row = await this.db
      .prepare('SELECT * FROM goals WHERE id = ?')
      .bind(id)
      .first<GoalRow>()
    return row ? toGoal(row) : null
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<GoalRow>()
    return results.map(toGoal)
  }

  async findByUserIdAndStatus(userId: string, status: GoalStatus): Promise<Goal[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY created_at DESC')
      .bind(userId, status)
      .all<GoalRow>()
    return results.map(toGoal)
  }

  async create(input: CreateGoalInput): Promise<Goal> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const currentValue = input.currentValue ?? 0
    await this.db
      .prepare(
        'INSERT INTO goals (id, user_id, type, title, target_value, current_value, unit, deadline, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.userId, input.type, input.title, input.targetValue, currentValue, input.unit, input.deadline, 'active', createdAt)
      .run()
    return { id, userId: input.userId, type: input.type, title: input.title, targetValue: input.targetValue, currentValue, unit: input.unit, deadline: input.deadline, status: 'active', createdAt }
  }

  async update(id: string, input: UpdateGoalInput): Promise<Goal | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const title = input.title ?? existing.title
    const targetValue = input.targetValue ?? existing.targetValue
    const currentValue = input.currentValue ?? existing.currentValue
    const unit = input.unit ?? existing.unit
    const deadline = input.deadline ?? existing.deadline
    const status = input.status ?? existing.status

    await this.db
      .prepare('UPDATE goals SET title = ?, target_value = ?, current_value = ?, unit = ?, deadline = ?, status = ? WHERE id = ?')
      .bind(title, targetValue, currentValue, unit, deadline, status, id)
      .run()
    return { ...existing, title, targetValue, currentValue, unit, deadline, status }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM goals WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
