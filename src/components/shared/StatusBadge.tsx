import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'default'

const STATUS_MAP: Record<string, StatusVariant> = {
  // Tenant status
  active: 'success',
  suspended: 'warning',
  // Subscription status
  past_due: 'destructive',
  canceled: 'secondary',
  none: 'secondary',
  // User status
  ACTIVE: 'success',
  INACTIVE: 'destructive',
  PENDING: 'warning',
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  destructive: 'bg-red-100 text-red-800 border-red-200',
  secondary: 'bg-gray-100 text-gray-700 border-gray-200',
  default: 'bg-blue-100 text-blue-800 border-blue-200',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_MAP[status] ?? 'default'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}
