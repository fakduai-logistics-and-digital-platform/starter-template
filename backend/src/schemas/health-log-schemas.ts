import z from 'zod'

export const healthLogSchema = z.object({
  id: z.uuid(),
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  steps: z.number().int().min(0),
  caloriesBurned: z.number().min(0),
  waterMl: z.number().min(0),
  sleepHours: z.number().min(0).max(24),
  mood: z.number().int().min(1).max(5),
  note: z.string().nullable(),
  createdAt: z.iso.datetime(),
})

export const createHealthLogSchema = z.object({
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  steps: z.number().int().min(0),
  caloriesBurned: z.number().min(0),
  waterMl: z.number().min(0),
  sleepHours: z.number().min(0).max(24),
  mood: z.number().int().min(1).max(5),
  note: z.string().optional(),
})

export const updateHealthLogSchema = z.object({
  steps: z.number().int().min(0).optional(),
  caloriesBurned: z.number().min(0).optional(),
  waterMl: z.number().min(0).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  note: z.string().optional(),
})

export const idParamSchema = z.object({ id: z.string().min(1) })
export const userIdParamSchema = z.object({ userId: z.string().min(1) })

export const healthLogResponseSchema = z.object({ data: healthLogSchema })
export const healthLogListResponseSchema = z.object({ data: z.array(healthLogSchema) })

export const errorResponseSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
})
