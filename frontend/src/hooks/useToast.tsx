import { useState, useCallback } from 'react'
import { ToastType } from '../components/Toast'

interface ToastData {
  id: number
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast])
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast])
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast])

  return {
    toasts,
    removeToast,
    showToast,
    success,
    error,
    info,
    warning
  }
}
