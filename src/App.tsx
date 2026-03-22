import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { AppRouter } from '@/routes'
import { Toaster } from '@/components/ui/toaster'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  )
}
