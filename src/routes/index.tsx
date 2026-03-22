import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AdminShell } from '@/components/layout/AdminShell'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const TenantListPage = lazy(() => import('@/features/tenants/TenantListPage').then((m) => ({ default: m.TenantListPage })))
const TenantDetailPage = lazy(() => import('@/features/tenants/TenantDetailPage').then((m) => ({ default: m.TenantDetailPage })))
const PlanListPage = lazy(() => import('@/features/plans/PlanListPage').then((m) => ({ default: m.PlanListPage })))
const PlanDetailPage = lazy(() => import('@/features/plans/PlanDetailPage').then((m) => ({ default: m.PlanDetailPage })))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <PrivateRoute>
                <AdminShell />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/tenants" replace />} />
            <Route path="/tenants" element={<TenantListPage />} />
            <Route path="/tenants/:id" element={<TenantDetailPage />} />
            <Route path="/plans" element={<PlanListPage />} />
            <Route path="/plans/:id" element={<PlanDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/tenants" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
