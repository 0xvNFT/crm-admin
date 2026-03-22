import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserCircle, KeyRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useChangePassword } from '@/api/endpoints/profile'
import { updateProfileSchema, changePasswordSchema } from '@/schemas/profile'
import type { UpdateProfileFormData, ChangePasswordFormData } from '@/schemas/profile'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'

export function ProfilePage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { firstName: '', lastName: '' },
  })

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  // Pre-fill name from current user
  useEffect(() => {
    if (!user) return
    const parts = user.fullName?.split(' ') ?? []
    profileForm.reset({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
    })
  }, [user, profileForm])

  async function onProfileSubmit(data: UpdateProfileFormData) {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Profile updated')
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  async function onPasswordSubmit(data: ChangePasswordFormData) {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <PageHeader title="Profile" description="Manage your account details" />

      {/* Profile info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <UserCircle className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled className="bg-muted text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <form onSubmit={(e) => void profileForm.handleSubmit(onProfileSubmit)(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...profileForm.register('firstName')} />
              {profileForm.formState.errors.firstName && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...profileForm.register('lastName')} />
              {profileForm.formState.errors.lastName && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
        </div>

        <form onSubmit={(e) => void passwordForm.handleSubmit(onPasswordSubmit)(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Min 8 chars · uppercase · lowercase · number · special char (@$!%*?&_.#-)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
