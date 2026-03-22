import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { usePlan } from '@/api/endpoints/admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { UpdatePlanModal } from './UpdatePlanModal'
import { formatCurrency, formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'

export function PlanDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: plan, isLoading, error } = usePlan(id)
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) return <LoadingSpinner />

  if (error || !plan) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Plan not found"
        description={error ? parseApiError(error) : 'This plan does not exist.'}
        action={
          <Button variant="outline" onClick={() => navigate('/plans')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/plans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={plan.name}
          description={`${formatLabel(plan.tier)} · ${formatLabel(plan.vertical)}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={plan.isActive ? 'active' : 'INACTIVE'} />
              <Button onClick={() => setEditOpen(true)}>Edit Plan</Button>
            </div>
          }
        />
      </div>

      {/* Plan details grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Monthly Price', value: formatCurrency(plan.priceMonthlyUsd) },
          { label: 'Max Users', value: plan.maxUsers.toLocaleString() },
          { label: 'Max Records', value: plan.maxRecords.toLocaleString() },
          { label: 'Vertical', value: formatLabel(plan.vertical) },
          { label: 'Created', value: formatDate(plan.createdAt) },
          {
            label: 'Stripe Price ID',
            value: plan.stripePriceId ?? '—',
            mono: true,
          },
        ].map(({ label, value, mono }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Features */}
      {plan.features.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Features
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.features.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <UpdatePlanModal open={editOpen} plan={plan} onClose={() => setEditOpen(false)} />
    </div>
  )
}
