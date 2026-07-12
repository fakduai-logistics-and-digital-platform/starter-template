// Cloudflare Workers entrypoint (referenced by wrangler.jsonc "main").
// Wires D1 + KV implementations into the runtime-agnostic app.
import { createApp } from './app'
import { createContainer } from './di/container'
import { D1GoalRepository } from './infrastructure/d1/d1-goal-repository'
import { D1HealthLogRepository } from './infrastructure/d1/d1-health-log-repository'
import { D1UserRepository } from './infrastructure/d1/d1-user-repository'
import { KVCacheRepository } from './infrastructure/kv/kv-cache-repository'
import type { Bindings } from './types'

const app = createApp((env) => {
  const bindings = env as Bindings
  return createContainer({
    userRepository: new D1UserRepository(bindings.DB),
    cacheRepository: new KVCacheRepository(bindings.KV),
    healthLogRepository: new D1HealthLogRepository(bindings.DB),
    goalRepository: new D1GoalRepository(bindings.DB),
  })
})

export default app
