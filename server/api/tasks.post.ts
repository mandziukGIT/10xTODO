import { createError, defineEventHandler, H3Error, readBody } from 'h3'
import { ZodError } from 'zod'
import { createTaskSchema } from '../validation/task.schema'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { TaskService } from '~/server/services/task.service'
import type { CreateTaskCommand } from '~/types'
import type { Database } from '~/db/database.types'


/**
 * POST /api/tasks
 * Creates a new task or subtask for the authenticated user
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

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = createTaskSchema.parse(body)

    // Create task
    const result = await taskService.createTask(validatedData as CreateTaskCommand, userId)

    // Return response with 201 Created status
    event.node.res.statusCode = 201
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
    console.error('Unexpected error in tasks.post.ts:', error)

    // Return generic server error for unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})

