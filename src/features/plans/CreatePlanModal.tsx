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
import { createPlanSchema, type CreatePlanFormData } from '@/schemas/plan'
import { useCreatePlan } from '@/api/endpoints/admin'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'

interface CreatePlanModalProps {
  open: boolean
  onClose: () => void
}

export function CreatePlanModal({ open, onClose }: CreatePlanModalProps) {
  const createPlan = useCreatePlan()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { vertical: 'pharma' },
  })

  const tier = watch('tier')

  function handleClose() {
    reset()
    onClose()
  }

  async function onSubmit(data: CreatePlanFormData) {
    const features = data.features
      ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
      : []
    try {
      await createPlan.mutateAsync({
        name: data.name,
        vertical: data.vertical,
        tier: data.tier,
        priceMonthlyUsd: data.priceMonthlyUsd,
        maxUsers: data.maxUsers,
        maxRecords: data.maxRecords,
        features,
      })
      toast.success('Plan created successfully')
      handleClose()
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="Starter Plan" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select
              value={tier}
              onValueChange={(v) => setValue('tier', v as CreatePlanFormData['tier'], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tier…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            {errors.tier && <p className="text-xs text-destructive">{errors.tier.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Monthly Price (USD)</Label>
            <Input type="number" min="0" step="0.01" placeholder="29" {...register('priceMonthlyUsd')} />
            {errors.priceMonthlyUsd && (
              <p className="text-xs text-destructive">{errors.priceMonthlyUsd.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Max Users</Label>
              <Input type="number" min="1" placeholder="10" {...register('maxUsers')} />
              {errors.maxUsers && (
                <p className="text-xs text-destructive">{errors.maxUsers.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Max Records</Label>
              <Input type="number" min="1" placeholder="1000" {...register('maxRecords')} />
              {errors.maxRecords && (
                <p className="text-xs text-destructive">{errors.maxRecords.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Features</Label>
            <Textarea
              placeholder="CRM access, Reports, API access"
              rows={3}
              {...register('features')}
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of features</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
