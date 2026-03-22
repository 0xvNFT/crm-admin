import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CreditCard, Pencil } from 'lucide-react'
import { usePlans } from '@/api/endpoints/admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { AdminTable } from '@/components/shared/AdminTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { CreatePlanModal } from './CreatePlanModal'
import { UpdatePlanModal } from './UpdatePlanModal'
import { formatCurrency, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import type { PlanResponse } from '@/api/app-types'

export function PlanListPage() {
  const navigate = useNavigate()
  const { data: plans = [], isLoading, error } = usePlans()

  const [createOpen, setCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanResponse | null>(null)

  if (isLoading) return <LoadingSpinner />
  if (error) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Failed to load plans"
        description={parseApiError(error)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description={`${plans.length} plan${plans.length !== 1 ? 's' : ''} total`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Plan
          </Button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No plans yet"
          description="Create your first subscription plan."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          }
        />
      ) : (
        <AdminTable
          data={plans}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => navigate(`/plans/${p.id}`)}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (p) => (
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatLabel(p.tier)}</p>
                </div>
              ),
            },
            {
              key: 'price',
              header: 'Price / mo',
              render: (p) => formatCurrency(p.priceMonthlyUsd),
            },
            {
              key: 'users',
              header: 'Max Users',
              render: (p) => p.maxUsers.toLocaleString(),
              hideOnMobile: true,
            },
            {
              key: 'records',
              header: 'Max Records',
              render: (p) => p.maxRecords.toLocaleString(),
              hideOnMobile: true,
            },
            {
              key: 'active',
              header: 'Status',
              render: (p) => <StatusBadge status={p.isActive ? 'active' : 'INACTIVE'} />,
            },
            {
              key: 'stripe',
              header: 'Stripe ID',
              render: (p) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {p.stripePriceId ?? '—'}
                </span>
              ),
              hideOnMobile: true,
            },
            {
              key: 'actions',
              header: '',
              render: (p) => (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingPlan(p)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {editingPlan && (
        <UpdatePlanModal
          open={!!editingPlan}
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  )
}
