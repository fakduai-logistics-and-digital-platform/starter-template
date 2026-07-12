import z from 'zod'

const goalTypeSchema = z.enum(['steps', 'calories', 'water', 'sleep', 'weight'])
const goalStatusSchema = z.enum(['active', 'completed', 'paused'])

export const goalSchema = z.object({
  id: z.uuid(),
  userId: z.string().min(1),
  type: goalTypeSchema,
  title: z.string().min(1),
  targetValue: z.number().positive(),
  currentValue: z.number().min(0),
  unit: z.string().min(1),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: goalStatusSchema,
  createdAt: z.iso.datetime(),
})

export const createGoalSchema = z.object({
  userId: z.string().min(1),
  type: goalTypeSchema,
  title: z.string().min(1),
  targetValue: z.number().positive(),
  currentValue: z.number().min(0).optional(),
  unit: z.string().min(1),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  unit: z.string().min(1).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: goalStatusSchema.optional(),
})

export const idParamSchema = z.object({ id: z.string().min(1) })
export const userIdParamSchema = z.object({ userId: z.string().min(1) })

export const goalResponseSchema = z.object({ data: goalSchema })
export const goalListResponseSchema = z.object({ data: z.array(goalSchema) })

export const errorResponseSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
})
