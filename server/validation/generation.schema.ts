import { z } from 'zod'

/**
 * Validation schema for generation request
 * 
 * Requirements:
 * - description: string (non-empty, max 1000 characters)
 */
export const createGenerationSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim()
})

/**
 * Type definition for the validated generation request
 */
export type ValidatedGenerationRequest = z.infer<typeof createGenerationSchema>
