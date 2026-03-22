import { useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updatePlanSchema, type UpdatePlanFormData } from '@/schemas/plan'
import { useUpdatePlan } from '@/api/endpoints/admin'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import type { PlanResponse } from '@/api/app-types'

interface UpdatePlanModalProps {
  open: boolean
  plan: PlanResponse
  onClose: () => void
}

export function UpdatePlanModal({ open, plan, onClose }: UpdatePlanModalProps) {
  const updatePlan = useUpdatePlan()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePlanFormData>({
    resolver: zodResolver(updatePlanSchema),
  })

  const tier = watch('tier')
  const isActive = watch('isActive')

  // Pre-fill when plan changes
  useEffect(() => {
    reset({
      name: plan.name,
      vertical: plan.vertical as 'pharma',
      tier: plan.tier,
      priceMonthlyUsd: plan.priceMonthlyUsd,
      maxUsers: plan.maxUsers,
      maxRecords: plan.maxRecords,
      features: plan.features.join(', '),
      isActive: plan.isActive,
      stripePriceId: plan.stripePriceId ?? '',
    })
  }, [plan, reset])

  async function onSubmit(data: UpdatePlanFormData) {
    const features = data.features
      ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
      : []
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        data: {
          name: data.name,
          priceMonthlyUsd: data.priceMonthlyUsd,
          maxUsers: data.maxUsers,
          maxRecords: data.maxRecords,
          features,
          isActive: data.isActive,
          stripePriceId: data.stripePriceId || null,
        },
      })
      toast.success('Plan updated successfully')
      onClose()
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Plan — {plan.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select
              value={tier}
              onValueChange={(v) => setValue('tier', v as UpdatePlanFormData['tier'], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Monthly Price (USD)</Label>
            <Input type="number" min="0" step="0.01" {...register('priceMonthlyUsd')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Max Users</Label>
              <Input type="number" min="1" {...register('maxUsers')} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Records</Label>
              <Input type="number" min="1" {...register('maxRecords')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Features</Label>
            <Textarea rows={3} {...register('features')} />
            <p className="text-xs text-muted-foreground">Comma-separated list of features</p>
          </div>

          <div className="space-y-1.5">
            <Label>Stripe Price ID</Label>
            <Input placeholder="price_xxxx" {...register('stripePriceId')} />
            <p className="text-xs text-muted-foreground">Set after creating the product in Stripe</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive ?? true}
              onChange={(e) => setValue('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
