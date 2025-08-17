import { type Database } from '~/db/database.types'
import { loginSchema } from '~/server/validation/auth.schema'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient<Database>(event)
    // Parse and validate request body
    const body = await readBody(event)
    
    // Validate using Zod schema
    const validation = loginSchema.safeParse(body)
    
    // If validation fails, return 400 with error details
    if (!validation.success) {
      return createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }
    
    const { email, password } = validation.data
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Handle authentication error
    if (error) {
      return createError({
        statusCode: 401,
        statusMessage: 'Authentication Failed',
        message: error?.message
      })
    }
    
    // Return user and session data
    return {
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    }
  } catch (err) {
    // Handle unexpected errors
    console.error('Login error:', err)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Wystąpił nieoczekiwany błąd podczas logowania'
    })
  }
})
