import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { useTenants, useTenantUsers } from '@/api/endpoints/admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { AdminTable } from '@/components/shared/AdminTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { parseApiError } from '@/utils/errors'
import { formatDate } from '@/utils/formatters'

export function TenantDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Find tenant from cached list — no GET /api/admin/tenants/:id endpoint
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants()
  const { data: users = [], isLoading: usersLoading, error: usersError } = useTenantUsers(id)

  const tenant = tenants.find((t) => t.id === id)

  if (tenantsLoading) return <LoadingSpinner />

  if (!tenant) {
    return (
      <EmptyState
        icon={Users}
        title="Tenant not found"
        description="This tenant may have been deleted or you may not have access."
        action={
          <Button variant="outline" onClick={() => navigate('/tenants')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Tenants
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={tenant.name}
          description={`/${tenant.slug} · ${tenant.dataRegion}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={tenant.status} />
              <StatusBadge status={tenant.subscriptionStatus} />
            </div>
          }
        />
      </div>

      {/* Tenant info */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Plan', value: tenant.planName },
          { label: 'Vertical', value: tenant.vertical },
          { label: 'Region', value: tenant.dataRegion },
          { label: 'Created', value: formatDate(tenant.createdAt) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Users */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Users</h2>

        {usersLoading ? (
          <LoadingSpinner />
        ) : usersError ? (
          <EmptyState
            icon={Users}
            title="Failed to load users"
            description={parseApiError(usersError)}
          />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users yet" description="This tenant has no users." />
        ) : (
          <AdminTable
            data={users}
            keyExtractor={(u) => u.id}
            columns={[
              {
                key: 'name',
                header: 'Name',
                render: (u) => `${u.firstName} ${u.lastName}`,
              },
              {
                key: 'email',
                header: 'Email',
                render: (u) => u.email,
              },
              {
                key: 'status',
                header: 'Status',
                render: (u) => <StatusBadge status={u.status} />,
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}
