import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { UpdateProfileRequest, UpdateProfileResponse, ChangePasswordRequest } from '@/api/app-types'

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      client.put<UpdateProfileResponse>('/api/auth/profile', data).then((r) => r.data),
    onSuccess: () => {
      // Invalidate /me so AuthProvider picks up the new fullName on next refetch
      void qc.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      client.post<{ message: string }>('/api/auth/change-password', data).then((r) => r.data),
  })
}
