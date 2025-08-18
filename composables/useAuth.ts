import { ref, readonly, computed } from 'vue'

// Korzystamy z useSupabaseUser zamiast własnej implementacji
export const useAuth = () => {
  const supabaseUser = useSupabaseUser()
  const client = useSupabaseClient()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed property sprawdzające czy użytkownik jest zalogowany
  const isAuthenticated = computed(() => !!supabaseUser.value)
  /**
   * Register a new user
   * @param email - User email
   * @param password - User password
   */
  const register = async (email: string, password: string) => {
    error.value = null
    isLoading.value = true
    
    try {
      const { error: supabaseError } = await client.auth.signUp({
        email,
        password
      })
      
      if (supabaseError) throw supabaseError
      
      await navigateTo('/')
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Wystąpił nieznany błąd'
      error.value = errorMsg
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   */
  const login = async (email: string, password: string) => {
    error.value = null
    isLoading.value = true
    
    try {
      const { data, error: supabaseError } = await client.auth.signInWithPassword({
        email,
        password
      })
      
      if (supabaseError) throw supabaseError
      
      // Przekierowanie na stronę główną zostanie obsłużone przez moduł Supabase
      await navigateTo('/')
      return data
    } catch {
      const errorMsg = 'Nieprawidłowy email lub hasło'
      error.value = errorMsg
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Logout the current user
   */
  const logout = async () => {
    error.value = null
    isLoading.value = true
    
    try {
      const { error: supabaseError } = await client.auth.signOut()
      
      if (supabaseError) throw supabaseError
      
      // Przekierowanie na stronę logowania zostanie obsłużone przez moduł Supabase
      await navigateTo('/auth/login')
    } catch {
      const errorMsg = 'An error occurred during logout'
      error.value = errorMsg
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Send password reset email
   * @param email - User email
   */
  const forgotPassword = async (email: string) => {
    error.value = null
    isLoading.value = true
    
    try {
      const { error: supabaseError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (supabaseError) throw supabaseError
    } catch {
      const errorMsg = 'An error occurred'
      error.value = errorMsg
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Reset password with token
   * @param newPassword - New password
   */
  const resetPassword = async (newPassword: string) => {
    error.value = null
    isLoading.value = true
    
    try {
      const { error: supabaseError } = await client.auth.updateUser({
        password: newPassword
      })
      
      if (supabaseError) throw supabaseError
      
      // Przekierowanie na stronę logowania zostanie obsłużone przez moduł Supabase
    } catch {
      const errorMsg = 'An error occurred'
      error.value = errorMsg
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: supabaseUser,
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
  }
}
