import { z } from 'zod'

/**
 * Schema for validating task creation requests
 */
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  parentTaskId: z.string().uuid().nullable(),
  source: z.enum(['ai_full', 'ai_edited', 'manual'] as const),
  generationId: z.string().uuid().nullable()
}).refine(data => {
  // generationId is required when source is ai_full or ai_edited
  if ((data.source === 'ai_full' || data.source === 'ai_edited') && !data.generationId) {
    return false
  }
  return true
}, {
  message: 'generationId is required when source is ai_full or ai_edited',
  path: ['generationId']
})

/**
 * Schema for validating task update requests
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable()
})

export type CreateTaskSchemaType = z.infer<typeof createTaskSchema>
export type UpdateTaskSchemaType = z.infer<typeof updateTaskSchema>
