import { Toast, ToastType } from './Toast'
import '../styles/Toast.css'

interface ToastData {
  id: number
  message: string
  type: ToastType
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemoveToast: (id: number) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  )
}
