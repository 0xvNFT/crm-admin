// Auth
export interface AuthUser {
  userId: string
  tenantId: string
  email: string
  fullName: string
  roles: string[]
}

export interface LoginRequest {
  email: string
  password: string
}

// Tenants
export interface TenantSummary {
  id: string
  name: string
  slug: string
  vertical: string
  status: 'active' | 'suspended'
  dataRegion: string
  planId: string
  planName: string
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'none'
  createdAt: string
}

export interface TenantUserSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
}

export interface CreateTenantRequest {
  name: string
  slug: string
  vertical: string
  planId: string
  billingEmail: string
  dataRegion?: string
  adminEmail?: string
  adminPassword?: string
}

// Plans
export interface PlanResponse {
  id: string
  name: string
  vertical: string
  tier: 'starter' | 'professional' | 'enterprise'
  priceMonthlyUsd: number
  maxUsers: number
  maxRecords: number
  features: string[]
  isActive: boolean
  stripePriceId: string | null
  createdAt: string
}

export interface CreatePlanRequest {
  name: string
  vertical: string
  tier: string
  priceMonthlyUsd: number
  maxUsers: number
  maxRecords: number
  features?: string[]
}

export interface UpdatePlanRequest {
  name?: string
  priceMonthlyUsd?: number
  maxUsers?: number
  maxRecords?: number
  features?: string[]
  isActive?: boolean
  stripePriceId?: string | null
}
