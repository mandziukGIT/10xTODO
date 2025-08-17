import type { Database } from '~/db/database.types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient<Database>(event)

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    // Handle sign out error
    if (error) {
      return createError({
        statusCode: 500,
        statusMessage: 'Logout Failed',
        message: error?.message
      })
    }
    
    // Return success response
    return {
      success: true
    }
  } catch (err) {
    // Handle unexpected errors
    console.error('Logout error:', err)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Wystąpił nieoczekiwany błąd podczas wylogowywania'
    })
  }
})
