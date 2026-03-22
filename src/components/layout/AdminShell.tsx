import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, CreditCard, ChevronLeft, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'

const SIDEBAR_OPEN_WIDTH = 240
const SIDEBAR_CLOSED_WIDTH = 64

interface NavItem {
  to: string
  icon: typeof Building2
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/tenants', icon: Building2, label: 'Tenants' },
  { to: '/plans', icon: CreditCard, label: 'Plans' },
]

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar wrapper — relative so toggle button can overflow */}
      <div className="relative flex h-full shrink-0">
      <motion.aside
        animate={{ width: collapsed ? SIDEBAR_CLOSED_WIDTH : SIDEBAR_OPEN_WIDTH }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar overflow-hidden"
      >
        {/* Logo / Brand */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="ml-3 text-sm font-semibold text-sidebar-foreground whitespace-nowrap"
              >
                CRM Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex h-10 w-full items-center rounded-md px-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[6px]'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="ml-3 whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-sidebar-border p-2">
          <div className={cn('flex items-center gap-2 px-2 py-2', collapsed && 'justify-center')}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user?.fullName?.charAt(0).toUpperCase() ?? 'S'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-xs font-medium text-sidebar-foreground">
                    {user?.fullName ?? 'Super Admin'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => void handleLogout()}
              title="Logout"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </motion.aside>

        {/* Collapse toggle — outside aside so it's not clipped */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-14 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft className="h-3 w-3" />
          </motion.div>
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
