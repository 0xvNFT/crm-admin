import { z } from 'zod'

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  vertical: z.literal('pharma'),
  tier: z.enum(['starter', 'professional', 'enterprise'], {
    errorMap: () => ({ message: 'Select a tier' }),
  }),
  priceMonthlyUsd: z.coerce.number().min(0, 'Price must be 0 or greater'),
  maxUsers: z.coerce.number().int().min(1, 'At least 1 user required'),
  maxRecords: z.coerce.number().int().min(1, 'At least 1 record required'),
  features: z.string().optional(), // comma-separated textarea; split on submit
})

export const updatePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  vertical: z.literal('pharma').optional(),
  tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  priceMonthlyUsd: z.coerce.number().min(0).optional(),
  maxUsers: z.coerce.number().int().min(1).optional(),
  maxRecords: z.coerce.number().int().min(1).optional(),
  features: z.string().optional(),
  isActive: z.boolean().optional(),
  stripePriceId: z.string().nullable().optional(),
})

export type CreatePlanFormData = z.infer<typeof createPlanSchema>
export type UpdatePlanFormData = z.infer<typeof updatePlanSchema>
