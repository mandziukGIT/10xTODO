import z, { ZodError } from 'zod'
import { GenerationService } from '~/server/services/generation.service'
import { createGenerationSchema } from '~/server/validation/generation.schema'
import type { CreateGenerationResponseDTO } from '~/types'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/db/database.types'

/**
 * POST /api/generations
 * 
 * Endpoint for generating AI task proposals based on user description
 * 
 * @returns Generated tasks with metadata
 */
export default defineEventHandler(async (event): Promise<CreateGenerationResponseDTO> => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }
    // Parse and validate request body
    const body = await readBody(event)
    
    try {
      const validatedData = createGenerationSchema.parse(body)
      
      const client = await serverSupabaseClient<Database>(event)
      const generationService = new GenerationService(client)
      // Call generation service with default user ID for development
      const result = await generationService.generateTasks(
        user.id,
        validatedData.description
      )
      
      // Set status code to 201 Created
      setResponseStatus(event, 201)
      
      return result
    } catch (err) {
      // Handle validation errors
      if (err instanceof ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: z.treeifyError(err)
        })
      }
      
      // Re-throw other errors
      throw err
    }
  } catch (error: unknown) {
    // Handle service errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // Error already formatted, just re-throw
      throw error
    }
    
    // Log unexpected errors
    console.error('Generation error:', error)
    
    // Return generic error to client
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to generate tasks'
    })
  }
})
