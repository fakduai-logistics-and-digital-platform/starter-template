import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createGoalRouter } from './goal-router'
import { createHealthLogRouter } from './health-log-router'
import { createUserRouter } from './user-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())
  api.route('/health-logs', createHealthLogRouter())
  api.route('/goals', createGoalRouter())

  return api
}
