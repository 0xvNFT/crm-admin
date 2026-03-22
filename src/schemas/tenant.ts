import { z } from 'zod'

export const createTenantSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
    vertical: z.literal('pharma'),
    planId: z.string().uuid('Select a valid plan'),
    billingEmail: z.string().email('Enter a valid billing email'),
    dataRegion: z.string().default('PH'),
    adminEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
    adminPassword: z.string().optional(),
  })
  .refine(
    (d) => !d.adminEmail || (d.adminPassword && d.adminPassword.length > 0),
    {
      message: 'Password is required when admin email is provided',
      path: ['adminPassword'],
    },
  )

export type CreateTenantFormData = z.infer<typeof createTenantSchema>
