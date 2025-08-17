import { z } from 'zod'
import type { 
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from '~/types'

export const useFormValidation = () => {
  /**
   * Validates registration form data using Zod
   * @param data - Form data to validate
   * @returns Object with validation result
   */
  const validateRegister = (data: Partial<RegisterInput>) => {
    try {
      registerSchema.parse(data)
      return { success: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as string
          return { ...acc, [path]: curr?.message }
        }, {})
        return { success: false, errors }
      }
      return { success: false, errors: { form: 'Wystąpił błąd walidacji' } }
    }
  }

  /**
   * Validates login form data using Zod
   * @param data - Form data to validate
   * @returns Object with validation result
   */
  const validateLogin = (data: Partial<LoginInput>) => {
    const result = loginSchema.safeParse(data)
    
    if (result.success) {
      return { success: true, errors: {} }
    } else {
      const errors = result.error.errors.reduce((acc, curr) => {
        const path = curr.path[0] as string
        return { ...acc, [path]: curr?.message }
      }, {})
      return { success: false, errors }
    }
  }

  /**
   * Validates forgot password form data using Zod
   * @param data - Form data to validate
   * @returns Object with validation result
   */
  const validateForgotPassword = (data: Partial<ForgotPasswordInput>) => {
    try {
      forgotPasswordSchema.parse(data)
      return { success: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as string
          return { ...acc, [path]: curr?.message }
        }, {})
        return { success: false, errors }
      }
      return { success: false, errors: { form: 'Wystąpił błąd walidacji' } }
    }
  }

  /**
   * Validates reset password form data using Zod
   * @param data - Form data to validate
   * @returns Object with validation result
   */
  const validateResetPassword = (data: Partial<ResetPasswordInput>) => {
    try {
      resetPasswordSchema.parse(data)
      return { success: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as string
          return { ...acc, [path]: curr?.message }
        }, {})
        return { success: false, errors }
      }
      return { success: false, errors: { form: 'Wystąpił błąd walidacji' } }
    }
  }

  return {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
  }
}