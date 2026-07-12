import type { CreateHealthLogInput, HealthLog, UpdateHealthLogInput } from '../../domain/entities/health-log'
import type { HealthLogRepository } from '../../domain/repositories/health-log-repository'

export class MemoryHealthLogRepository implements HealthLogRepository {
  private readonly logs = new Map<string, HealthLog>()

  async findAll(): Promise<HealthLog[]> {
    return [...this.logs.values()].sort((a, b) => b.date.localeCompare(a.date))
  }

  async findById(id: string): Promise<HealthLog | null> {
    return this.logs.get(id) ?? null
  }

  async findByUserId(userId: string): Promise<HealthLog[]> {
    return [...this.logs.values()]
      .filter((l) => l.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async findByUserIdAndDate(userId: string, date: string): Promise<HealthLog | null> {
    return [...this.logs.values()].find((l) => l.userId === userId && l.date === date) ?? null
  }

  async create(input: CreateHealthLogInput): Promise<HealthLog> {
    const log: HealthLog = {
      id: crypto.randomUUID(),
      userId: input.userId,
      date: input.date,
      steps: input.steps,
      caloriesBurned: input.caloriesBurned,
      waterMl: input.waterMl,
      sleepHours: input.sleepHours,
      mood: input.mood,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
    }
    this.logs.set(log.id, log)
    return log
  }

  async update(id: string, input: UpdateHealthLogInput): Promise<HealthLog | null> {
    const existing = this.logs.get(id)
    if (!existing) return null
    const updated: HealthLog = {
      ...existing,
      steps: input.steps ?? existing.steps,
      caloriesBurned: input.caloriesBurned ?? existing.caloriesBurned,
      waterMl: input.waterMl ?? existing.waterMl,
      sleepHours: input.sleepHours ?? existing.sleepHours,
      mood: input.mood ?? existing.mood,
      note: input.note !== undefined ? input.note : existing.note,
    }
    this.logs.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.logs.delete(id)
  }
}
