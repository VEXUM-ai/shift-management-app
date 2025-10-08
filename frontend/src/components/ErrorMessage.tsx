import React from 'react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p>❌ {message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          再試行
        </button>
      )}
    </div>
  )
}
