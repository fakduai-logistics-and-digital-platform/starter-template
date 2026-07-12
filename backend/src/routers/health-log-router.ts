import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createHealthLogSchema,
  errorResponseSchema,
  healthLogListResponseSchema,
  healthLogResponseSchema,
  idParamSchema,
  updateHealthLogSchema,
  userIdParamSchema,
} from '../schemas/health-log-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createHealthLogRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['HealthLogs'],
      summary: 'List all health logs',
      responses: {
        200: { description: 'All health logs', content: jsonContent(healthLogListResponseSchema) },
      },
    }),
    (c) => c.get('container').healthLogHandler.list(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['HealthLogs'],
      summary: 'Create a health log',
      responses: {
        201: { description: 'Health log created', content: jsonContent(healthLogResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        409: { description: 'Log for this date already exists', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createHealthLogSchema),
    (c) => c.get('container').healthLogHandler.create(c)
  )

  router.get(
    '/user/:userId',
    describeRoute({
      tags: ['HealthLogs'],
      summary: 'List health logs by user',
      responses: {
        200: { description: 'User health logs', content: jsonContent(healthLogListResponseSchema) },
      },
    }),
    validator('param', userIdParamSchema),
    (c) => c.get('container').healthLogHandler.listByUser(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['HealthLogs'],
      summary: 'Get a health log by id',
      responses: {
        200: { description: 'Health log found', content: jsonContent(healthLogResponseSchema) },
        404: { description: 'Health log not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').healthLogHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['HealthLogs'],
      summary: 'Update a health log',
      responses: {
        200: { description: 'Health log updated', content: jsonContent(healthLogResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Health log not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateHealthLogSchema),
    (c) => c.get('container').healthLogHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['HealthLogs'],
      summary: 'Delete a health log',
      responses: {
        204: { description: 'Health log deleted' },
        404: { description: 'Health log not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').healthLogHandler.delete(c)
  )

  return router
}
