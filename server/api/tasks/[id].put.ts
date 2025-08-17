import { createError, defineEventHandler, H3Error, readBody } from 'h3'
import { ZodError } from 'zod'
import { updateTaskSchema } from '../../validation/task.schema'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { TaskService } from '~/server/services/task.service'
import type { UpdateTaskCommand } from '~/types'
import type { Database } from '~/db/database.types'

/**
 * PUT /api/tasks/{id}
 * Updates a task's basic data (title, description)
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }
    const userId = user.id
    const client = await serverSupabaseClient<Database>(event)
    const taskService = new TaskService(client)

    // Get task ID from URL params
    const taskId = event.context.params?.id
    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required',
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = updateTaskSchema.parse(body)

    // Update task
    const result = await taskService.updateTask(taskId, validatedData as UpdateTaskCommand, userId)

    // Return response with 200 OK status
    return result
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.format(),
      })
    }

    // Re-throw H3Error (already formatted errors from service)
    if (error instanceof H3Error) {
      throw error
    }

    // Log unexpected errors
    console.error('Unexpected error in tasks/[id].put.ts:', error)

    // Return generic server error for unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
