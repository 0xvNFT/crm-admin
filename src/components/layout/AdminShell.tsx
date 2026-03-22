import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  CreditCard,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  UserCircle,
  Menu,
} from 'lucide-react'
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ─── Shared sidebar content ─────────────────────────────────────────────────
interface SidebarContentProps {
  collapsed: boolean
  user: { fullName?: string; email?: string } | null
  onNavClick: () => void
  onLogout: () => void
}

function SidebarContent({ collapsed, user, onNavClick, onLogout }: SidebarContentProps) {
  const sidebarOpen = !collapsed
  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
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

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
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
              {sidebarOpen && (
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

      {/* User / Profile / Logout */}
      <div className="border-t border-sidebar-border p-2">
        <NavLink
          to="/profile"
          onClick={onNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-2 py-2 transition-colors w-full',
              isActive ? 'bg-primary/10 text-primary' : 'hover:bg-sidebar-accent',
              !sidebarOpen && 'justify-center',
            )
          }
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user?.fullName?.charAt(0).toUpperCase() ?? 'S'}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
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
          {sidebarOpen && <UserCircle className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </NavLink>

        <div className={cn('flex mt-1', !sidebarOpen ? 'justify-center' : 'px-2')}>
          <button
            onClick={onLogout}
            title="Logout"
            className={cn(
              'flex items-center gap-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              sidebarOpen && 'w-full text-xs font-medium',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Shell ───────────────────────────────────────────────────────────────────
export function AdminShell() {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (error: unknown) {
      toast.error(parseApiError(error))
    }
  }

  const sidebarOpen = !collapsed

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── MOBILE ── fixed overlay, zero layout impact */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-20 bg-black/40"
                onClick={() => setCollapsed(true)}
              />
            )}
          </AnimatePresence>

          {/* Slide-in sidebar */}
          <motion.aside
            initial={false}
            animate={{ x: sidebarOpen ? 0 : -SIDEBAR_OPEN_WIDTH }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: SIDEBAR_OPEN_WIDTH }}
            className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden"
          >
            <SidebarContent
              collapsed={false}
              user={user}
              onNavClick={() => setCollapsed(true)}
              onLogout={() => void handleLogout()}
            />
          </motion.aside>

          {/* Hamburger button */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="fixed left-3 top-3 z-40 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>
        </>
      )}

      {/* ── DESKTOP ── in flex flow, width-animates */}
      {!isMobile && (
        <div className="relative shrink-0">
          <motion.aside
            animate={{ width: sidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex h-full flex-col border-r border-sidebar-border bg-sidebar overflow-hidden"
          >
            <SidebarContent
              collapsed={collapsed}
              user={user}
              onNavClick={() => {}}
              onLogout={() => void handleLogout()}
            />
          </motion.aside>

          {/* Chevron toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-14 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft className="h-3 w-3" />
            </motion.div>
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ── always full remaining width */}
      <main className="flex-1 overflow-auto min-w-0">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('p-6', isMobile && 'pt-14')}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
