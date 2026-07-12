import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createGoalSchema,
  errorResponseSchema,
  goalListResponseSchema,
  goalResponseSchema,
  idParamSchema,
  updateGoalSchema,
  userIdParamSchema,
} from '../schemas/goal-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createGoalRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Goals'],
      summary: 'List all goals',
      responses: {
        200: { description: 'All goals', content: jsonContent(goalListResponseSchema) },
      },
    }),
    (c) => c.get('container').goalHandler.list(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Goals'],
      summary: 'Create a goal',
      responses: {
        201: { description: 'Goal created', content: jsonContent(goalResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createGoalSchema),
    (c) => c.get('container').goalHandler.create(c)
  )

  router.get(
    '/user/:userId',
    describeRoute({
      tags: ['Goals'],
      summary: 'List goals by user',
      responses: {
        200: { description: 'User goals', content: jsonContent(goalListResponseSchema) },
      },
    }),
    validator('param', userIdParamSchema),
    (c) => c.get('container').goalHandler.listByUser(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Goals'],
      summary: 'Get a goal by id',
      responses: {
        200: { description: 'Goal found', content: jsonContent(goalResponseSchema) },
        404: { description: 'Goal not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').goalHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Goals'],
      summary: 'Update a goal',
      responses: {
        200: { description: 'Goal updated', content: jsonContent(goalResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Goal not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateGoalSchema),
    (c) => c.get('container').goalHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Goals'],
      summary: 'Delete a goal',
      responses: {
        204: { description: 'Goal deleted' },
        404: { description: 'Goal not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').goalHandler.delete(c)
  )

  return router
}
