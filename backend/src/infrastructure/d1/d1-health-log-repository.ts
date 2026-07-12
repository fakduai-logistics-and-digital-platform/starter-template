import type { CreateHealthLogInput, HealthLog, UpdateHealthLogInput } from '../../domain/entities/health-log'
import type { HealthLogRepository } from '../../domain/repositories/health-log-repository'

interface HealthLogRow {
  id: string
  user_id: string
  date: string
  steps: number
  calories_burned: number
  water_ml: number
  sleep_hours: number
  mood: number
  note: string | null
  created_at: string
}

function toHealthLog(row: HealthLogRow): HealthLog {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    steps: row.steps,
    caloriesBurned: row.calories_burned,
    waterMl: row.water_ml,
    sleepHours: row.sleep_hours,
    mood: row.mood,
    note: row.note,
    createdAt: row.created_at,
  }
}

export class D1HealthLogRepository implements HealthLogRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<HealthLog[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM health_logs ORDER BY date DESC, created_at DESC')
      .all<HealthLogRow>()
    return results.map(toHealthLog)
  }

  async findById(id: string): Promise<HealthLog | null> {
    const row = await this.db
      .prepare('SELECT * FROM health_logs WHERE id = ?')
      .bind(id)
      .first<HealthLogRow>()
    return row ? toHealthLog(row) : null
  }

  async findByUserId(userId: string): Promise<HealthLog[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM health_logs WHERE user_id = ? ORDER BY date DESC')
      .bind(userId)
      .all<HealthLogRow>()
    return results.map(toHealthLog)
  }

  async findByUserIdAndDate(userId: string, date: string): Promise<HealthLog | null> {
    const row = await this.db
      .prepare('SELECT * FROM health_logs WHERE user_id = ? AND date = ?')
      .bind(userId, date)
      .first<HealthLogRow>()
    return row ? toHealthLog(row) : null
  }

  async create(input: CreateHealthLogInput): Promise<HealthLog> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare(
        'INSERT INTO health_logs (id, user_id, date, steps, calories_burned, water_ml, sleep_hours, mood, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.userId, input.date, input.steps, input.caloriesBurned, input.waterMl, input.sleepHours, input.mood, input.note ?? null, createdAt)
      .run()
    return { id, userId: input.userId, date: input.date, steps: input.steps, caloriesBurned: input.caloriesBurned, waterMl: input.waterMl, sleepHours: input.sleepHours, mood: input.mood, note: input.note ?? null, createdAt }
  }

  async update(id: string, input: UpdateHealthLogInput): Promise<HealthLog | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const steps = input.steps ?? existing.steps
    const caloriesBurned = input.caloriesBurned ?? existing.caloriesBurned
    const waterMl = input.waterMl ?? existing.waterMl
    const sleepHours = input.sleepHours ?? existing.sleepHours
    const mood = input.mood ?? existing.mood
    const note = input.note !== undefined ? input.note : existing.note

    await this.db
      .prepare('UPDATE health_logs SET steps = ?, calories_burned = ?, water_ml = ?, sleep_hours = ?, mood = ?, note = ? WHERE id = ?')
      .bind(steps, caloriesBurned, waterMl, sleepHours, mood, note, id)
      .run()
    return { ...existing, steps, caloriesBurned, waterMl, sleepHours, mood, note }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM health_logs WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
