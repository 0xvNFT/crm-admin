import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  TenantSummary,
  TenantUserSummary,
  PlanResponse,
  CreateTenantRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
} from '@/api/app-types'

// ─── Query Keys ─────────────────────────────────────────────────────────────
export const adminKeys = {
  tenants: ['admin', 'tenants'] as const,
  tenantUsers: (id: string) => ['admin', 'tenants', id, 'users'] as const,
  plans: ['admin', 'plans'] as const,
  plan: (id: string) => ['admin', 'plans', id] as const,
}

// ─── Tenant Queries ──────────────────────────────────────────────────────────
export function useTenants() {
  return useQuery({
    queryKey: adminKeys.tenants,
    queryFn: () => client.get<TenantSummary[]>('/api/admin/tenants').then((r) => r.data),
  })
}

export function useTenantUsers(tenantId: string) {
  return useQuery({
    queryKey: adminKeys.tenantUsers(tenantId),
    queryFn: () =>
      client.get<TenantUserSummary[]>(`/api/admin/tenants/${tenantId}/users`).then((r) => r.data),
    enabled: !!tenantId,
  })
}

// ─── Tenant Mutations ────────────────────────────────────────────────────────
export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenantRequest) =>
      client.post<TenantSummary>('/api/admin/tenants', data).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.tenants })
    },
  })
}

export function useSuspendTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/admin/tenants/${id}/suspend`).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.tenants })
    },
  })
}

export function useReactivateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/admin/tenants/${id}/reactivate`).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.tenants })
    },
  })
}

// ─── Plan Queries ────────────────────────────────────────────────────────────
export function usePlans() {
  return useQuery({
    queryKey: adminKeys.plans,
    queryFn: () => client.get<PlanResponse[]>('/api/admin/plans').then((r) => r.data),
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: adminKeys.plan(id),
    queryFn: () => client.get<PlanResponse>(`/api/admin/plans/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

// ─── Plan Mutations ──────────────────────────────────────────────────────────
export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlanRequest) =>
      client.post<PlanResponse>('/api/admin/plans', data).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.plans })
    },
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
      client.put<PlanResponse>(`/api/admin/plans/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: adminKeys.plans })
      void qc.invalidateQueries({ queryKey: adminKeys.plan(id) })
    },
  })
}
