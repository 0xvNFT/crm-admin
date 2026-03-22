import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2 } from 'lucide-react'
import { useTenants, useSuspendTenant, useReactivateTenant } from '@/api/endpoints/admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { AdminTable } from '@/components/shared/AdminTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { CreateTenantModal } from './CreateTenantModal'
import { formatDate } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import type { TenantSummary } from '@/api/app-types'

export function TenantListPage() {
  const navigate = useNavigate()
  const { data: tenants = [], isLoading, error } = useTenants()
  const suspendTenant = useSuspendTenant()
  const reactivateTenant = useReactivateTenant()

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'reactivate'
    tenant: TenantSummary
  } | null>(null)

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleConfirm() {
    if (!confirmAction) return
    const { type, tenant } = confirmAction
    try {
      if (type === 'suspend') {
        await suspendTenant.mutateAsync(tenant.id)
        toast.success(`${tenant.name} suspended`)
      } else {
        await reactivateTenant.mutateAsync(tenant.id)
        toast.success(`${tenant.name} reactivated`)
      }
    } catch (err: unknown) {
      toast.error(parseApiError(err))
    } finally {
      setConfirmAction(null)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) {
    return (
      <EmptyState
        icon={Building2}
        title="Failed to load tenants"
        description={parseApiError(error)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description={`${tenants.length} tenant${tenants.length !== 1 ? 's' : ''} total`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name or slug…"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? 'No tenants match your search' : 'No tenants yet'}
          description={search ? undefined : 'Create your first tenant to get started.'}
          action={
            !search ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Tenant
              </Button>
            ) : undefined
          }
        />
      ) : (
        <AdminTable
          data={filtered}
          keyExtractor={(t) => t.id}
          onRowClick={(t) => navigate(`/tenants/${t.id}`)}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (t) => (
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.slug}</p>
                </div>
              ),
            },
            {
              key: 'plan',
              header: 'Plan',
              render: (t) => t.planName,
            },
            {
              key: 'status',
              header: 'Status',
              render: (t) => <StatusBadge status={t.status} />,
            },
            {
              key: 'subscription',
              header: 'Subscription',
              render: (t) => <StatusBadge status={t.subscriptionStatus} />,
            },
            {
              key: 'region',
              header: 'Region',
              render: (t) => t.dataRegion,
            },
            {
              key: 'created',
              header: 'Created',
              render: (t) => formatDate(t.createdAt),
            },
            {
              key: 'actions',
              header: '',
              render: (t) => (
                <div className="flex justify-end">
                  {t.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmAction({ type: 'suspend', tenant: t })
                      }}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmAction({ type: 'reactivate', tenant: t })
                      }}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <CreateTenantModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'suspend' ? 'Suspend Tenant' : 'Reactivate Tenant'}
        description={
          confirmAction?.type === 'suspend'
            ? `Are you sure you want to suspend "${confirmAction?.tenant.name}"? Their users will lose access.`
            : `Reactivate "${confirmAction?.tenant.name}"? Their users will regain access.`
        }
        confirmLabel={confirmAction?.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirmAction?.type === 'suspend' ? 'destructive' : 'default'}
        isPending={suspendTenant.isPending || reactivateTenant.isPending}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
