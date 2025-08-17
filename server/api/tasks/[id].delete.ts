import { createError, defineEventHandler, getRouterParam, H3Error } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { TaskService } from '~/server/services/task.service'
import type { Database } from '~/db/database.types'

/**
 * DELETE /api/tasks/:id
 * Deletes a task and its subtasks
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

    // Get task ID from route parameter
    const taskId = getRouterParam(event, 'id')

    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required',
      })
    }

    // Delete task
    const result = await taskService.deleteTask(taskId, userId)

    return result
  } catch (error) {
    // Re-throw H3Error (already formatted errors from service)
    if (error instanceof H3Error) {
      throw error
    }
    
    // Log unexpected errors
    console.error('Unexpected error in tasks/[id].delete.ts:', error)
    
    // Return generic server error for unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
