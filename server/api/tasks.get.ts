import { createError, defineEventHandler, getQuery, H3Error } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { TaskService } from '~/server/services/task.service'
import type { Database } from '~/db/database.types'

/**
 * GET /api/tasks
 * Retrieves all tasks for the authenticated user with pagination
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Number of items per page (default: 20, max: 100)
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

    // Parse query parameters
    const query = getQuery(event)
    const page = query.page ? Number.parseInt(query.page as string, 10) : 1
    const limit = query.page ? Number.parseInt(query.limit as string, 10) : 20

    // Get tasks with pagination
    const result = await taskService.getTasks(userId, page, limit)

    return result
  } catch (error) {
    // Re-throw H3Error (already formatted errors from service)
    if (error instanceof H3Error) {
      throw error
    }
    
    // Log unexpected errors
    console.error('Unexpected error in tasks.get.ts:', error)
    
    // Return generic server error for unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
