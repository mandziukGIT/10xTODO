import { z } from 'zod'

// Email validation
export const emailSchema = z.string({
  required_error: 'Email jest wymagany'
}).email('Podaj poprawny adres e-mail')

// Password validation
export const passwordSchema = z.string({
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

// Types derived from schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
