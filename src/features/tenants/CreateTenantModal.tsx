import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTenantSchema, type CreateTenantFormData } from '@/schemas/tenant'
import { useCreateTenant } from '@/api/endpoints/admin'
import { usePlans } from '@/api/endpoints/admin'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'

interface CreateTenantModalProps {
  open: boolean
  onClose: () => void
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function CreateTenantModal({ open, onClose }: CreateTenantModalProps) {
  const { data: plans = [] } = usePlans()
  const createTenant = useCreateTenant()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { vertical: 'pharma', dataRegion: 'PH' },
  })

  const planId = watch('planId')

  function handleClose() {
    reset()
    onClose()
  }

  async function onSubmit(data: CreateTenantFormData) {
    try {
      await createTenant.mutateAsync({
        name: data.name,
        slug: data.slug,
        vertical: data.vertical,
        planId: data.planId,
        billingEmail: data.billingEmail,
        dataRegion: data.dataRegion,
        adminEmail: data.adminEmail || undefined,
        adminPassword: data.adminPassword || undefined,
      })
      toast.success('Tenant created successfully')
      handleClose()
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Tenant</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="Acme Corp"
                {...register('name', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    setValue('slug', toSlug(e.target.value), { shouldValidate: false })
                  },
                })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input placeholder="acme-corp" {...register('slug')} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={(v) => setValue('planId', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan…" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.tier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.planId && <p className="text-xs text-destructive">{errors.planId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Billing Email</Label>
            <Input type="email" placeholder="billing@acme.com" {...register('billingEmail')} />
            {errors.billingEmail && (
              <p className="text-xs text-destructive">{errors.billingEmail.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Data Region</Label>
            <Input placeholder="PH" {...register('dataRegion')} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Admin User (optional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Admin Email</Label>
                <Input type="email" placeholder="admin@acme.com" {...register('adminEmail')} />
                {errors.adminEmail && (
                  <p className="text-xs text-destructive">{errors.adminEmail.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Admin Password</Label>
                <Input type="password" placeholder="••••••••" {...register('adminPassword')} />
                {errors.adminPassword && (
                  <p className="text-xs text-destructive">{errors.adminPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
