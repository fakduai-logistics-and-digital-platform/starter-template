import type { CreateHealthLogInput, HealthLog, UpdateHealthLogInput } from '../domain/entities/health-log'
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors'
import type { HealthLogRepository } from '../domain/repositories/health-log-repository'

export class HealthLogService {
  constructor(private readonly healthLogRepository: HealthLogRepository) {}

  async listHealthLogs(): Promise<HealthLog[]> {
    return this.healthLogRepository.findAll()
  }

  async getHealthLog(id: string): Promise<HealthLog> {
    const log = await this.healthLogRepository.findById(id)
    if (!log) throw new NotFoundError('HealthLog')
    return log
  }

  async getUserHealthLogs(userId: string): Promise<HealthLog[]> {
    return this.healthLogRepository.findByUserId(userId)
  }

  async createHealthLog(input: CreateHealthLogInput): Promise<HealthLog> {
    if (!input.userId?.trim()) throw new ValidationError('userId is required')
    if (!this.isValidDate(input.date)) throw new ValidationError('date must be YYYY-MM-DD')
    this.validateMetrics(input)

    const existing = await this.healthLogRepository.findByUserIdAndDate(input.userId, input.date)
    if (existing) throw new ConflictError(`Health log for ${input.date} already exists for this user`)

    return this.healthLogRepository.create(input)
  }

  async updateHealthLog(id: string, input: UpdateHealthLogInput): Promise<HealthLog> {
    if (Object.keys(input).length === 0) throw new ValidationError('No fields to update')
    this.validateMetrics(input)

    const updated = await this.healthLogRepository.update(id, input)
    if (!updated) throw new NotFoundError('HealthLog')
    return updated
  }

  async deleteHealthLog(id: string): Promise<void> {
    const deleted = await this.healthLogRepository.delete(id)
    if (!deleted) throw new NotFoundError('HealthLog')
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date))
  }

  private validateMetrics(input: Partial<CreateHealthLogInput>): void {
    if (input.steps !== undefined && input.steps < 0) throw new ValidationError('steps must be >= 0')
    if (input.caloriesBurned !== undefined && input.caloriesBurned < 0) throw new ValidationError('caloriesBurned must be >= 0')
    if (input.waterMl !== undefined && input.waterMl < 0) throw new ValidationError('waterMl must be >= 0')
    if (input.sleepHours !== undefined && (input.sleepHours < 0 || input.sleepHours > 24)) throw new ValidationError('sleepHours must be 0–24')
    if (input.mood !== undefined && (input.mood < 1 || input.mood > 5)) throw new ValidationError('mood must be 1–5')
  }
}
