import type { CreateHealthLogInput, HealthLog, UpdateHealthLogInput } from '../entities/health-log'

export interface HealthLogRepository {
  findAll(): Promise<HealthLog[]>
  findById(id: string): Promise<HealthLog | null>
  findByUserId(userId: string): Promise<HealthLog[]>
  findByUserIdAndDate(userId: string, date: string): Promise<HealthLog | null>
  create(input: CreateHealthLogInput): Promise<HealthLog>
  update(id: string, input: UpdateHealthLogInput): Promise<HealthLog | null>
  delete(id: string): Promise<boolean>
}
