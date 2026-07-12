import type { Context } from 'hono'
import type { CreateGoalInput, UpdateGoalInput } from '../domain/entities/goal'
import { ValidationError } from '../domain/errors'
import type { GoalService } from '../services/goal-service'

export class GoalHandler {
  constructor(private readonly goalService: GoalService) {}

  list = async (c: Context) => {
    const goals = await this.goalService.listGoals()
    return c.json({ data: goals })
  }

  listByUser = async (c: Context) => {
    const goals = await this.goalService.getUserGoals(this.param(c, 'userId'))
    return c.json({ data: goals })
  }

  get = async (c: Context) => {
    const goal = await this.goalService.getGoal(this.param(c, 'id'))
    return c.json({ data: goal })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateGoalInput>(c)
    const goal = await this.goalService.createGoal(body)
    return c.json({ data: goal }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateGoalInput>(c)
    const goal = await this.goalService.updateGoal(this.param(c, 'id'), body)
    return c.json({ data: goal })
  }

  delete = async (c: Context) => {
    await this.goalService.deleteGoal(this.param(c, 'id'))
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
