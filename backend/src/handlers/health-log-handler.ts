import type { Context } from 'hono'
import type { CreateHealthLogInput, UpdateHealthLogInput } from '../domain/entities/health-log'
import { ValidationError } from '../domain/errors'
import type { HealthLogService } from '../services/health-log-service'

export class HealthLogHandler {
  constructor(private readonly healthLogService: HealthLogService) {}

  list = async (c: Context) => {
    const logs = await this.healthLogService.listHealthLogs()
    return c.json({ data: logs })
  }

  listByUser = async (c: Context) => {
    const logs = await this.healthLogService.getUserHealthLogs(this.param(c, 'userId'))
    return c.json({ data: logs })
  }

  get = async (c: Context) => {
    const log = await this.healthLogService.getHealthLog(this.param(c, 'id'))
    return c.json({ data: log })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateHealthLogInput>(c)
    const log = await this.healthLogService.createHealthLog(body)
    return c.json({ data: log }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateHealthLogInput>(c)
    const log = await this.healthLogService.updateHealthLog(this.param(c, 'id'), body)
    return c.json({ data: log })
  }

  delete = async (c: Context) => {
    await this.healthLogService.deleteHealthLog(this.param(c, 'id'))
    return c.body(null, 204)
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
