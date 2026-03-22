import { useState, useCallback, useEffect } from 'react'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

// Module-level state — any component can trigger toasts without prop drilling
let listeners: Array<(toasts: ToastData[]) => void> = []
let toasts: ToastData[] = []

function dispatch(next: ToastData[]) {
  toasts = next
  listeners.forEach((l) => l(toasts))
}

export function toast(title: string, options?: { description?: string; variant?: ToastVariant }) {
  const id = Math.random().toString(36).slice(2)
  dispatch([...toasts, { id, title, description: options?.description, variant: options?.variant ?? 'default' }])
  setTimeout(() => {
    dispatch(toasts.filter((t) => t.id !== id))
  }, 4000)
}

toast.success = (title: string, options?: { description?: string }) =>
  toast(title, { ...options, variant: 'success' })

toast.error = (title: string, options?: { description?: string }) =>
  toast(title, { ...options, variant: 'destructive' })

export function useToast() {
  const [state, setState] = useState<ToastData[]>(toasts)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    dispatch(toasts.filter((t) => t.id !== id))
  }, [])

  return { toasts: state, dismiss }
}
