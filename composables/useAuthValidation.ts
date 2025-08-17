import { z } from 'zod'
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '~/types'

// Email validation
const emailSchema = z.string({
  required_error: 'Email jest wymagany'
}).email('Podaj poprawny adres e-mail')

// Password validation
const passwordSchema = z.string({
  required_error: 'Hasło jest wymagane'
}).min(6, 'Hasło musi mieć co najmniej 6 znaków')

// Schema for registration
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string({
    required_error: 'Potwierdzenie hasła jest wymagane'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword']
})

// Schema for login
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

// Schema for forgot password
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

// Schema for reset password
export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: passwordSchema,
  confirmPassword: z.string({
    required_error: 'Potwierdzenie hasła jest wymagane'
  })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword']
})

export function useAuthValidation() {
  const validateLogin = (data: LoginInput) => {
    return loginSchema.safeParse(data)
  }

  const validateRegister = (data: RegisterInput) => {
    return registerSchema.safeParse(data)
  }

  const validateForgotPassword = (data: ForgotPasswordInput) => {
    return forgotPasswordSchema.safeParse(data)
  }

  const validateResetPassword = (data: ResetPasswordInput) => {
    return resetPasswordSchema.safeParse(data)
  }

  return {
    validateLogin,
    validateRegister,
    validateForgotPassword,
    validateResetPassword
  }
}
