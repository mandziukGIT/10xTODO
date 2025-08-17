import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { TaskService } from '~/server/services/task.service'
import type { Database } from '~/db/database.types'

/**
 * PATCH /api/tasks/:id/complete
 *
 * Toggles the completion status of a task
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
    // Get task ID from route params
    const taskId = getRouterParam(event, 'id')

    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required',
      })
    }

    // Call the service to toggle completion status
    const result = await taskService.completeTask(taskId, userId)

    // Return success response
    return result
  } catch (error) {
    // Re-throw H3 errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Log and wrap other errors
    console.error('Error in complete task handler:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update task completion status'
    })
  }
})
