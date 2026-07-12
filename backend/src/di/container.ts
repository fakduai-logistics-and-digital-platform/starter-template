import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { GoalRepository } from '../domain/repositories/goal-repository'
import type { HealthLogRepository } from '../domain/repositories/health-log-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import { GoalHandler } from '../handlers/goal-handler'
import { HealthLogHandler } from '../handlers/health-log-handler'
import { UserHandler } from '../handlers/user-handler'
import { GoalService } from '../services/goal-service'
import { HealthLogService } from '../services/health-log-service'
import { UserService } from '../services/user-service'

export interface Repositories {
  userRepository: UserRepository
  cacheRepository: CacheRepository
  healthLogRepository: HealthLogRepository
  goalRepository: GoalRepository
}

export interface Container {
  userHandler: UserHandler
  healthLogHandler: HealthLogHandler
  goalHandler: GoalHandler
}

export function createContainer(repos: Repositories): Container {
  const userService = new UserService(repos.userRepository, repos.cacheRepository)
  const healthLogService = new HealthLogService(repos.healthLogRepository)
  const goalService = new GoalService(repos.goalRepository)
  return {
    userHandler: new UserHandler(userService),
    healthLogHandler: new HealthLogHandler(healthLogService),
    goalHandler: new GoalHandler(goalService),
  }
}
