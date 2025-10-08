import React from 'react'

interface FormErrorProps {
  message: string | null
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null

  return (
    <div className="form-error">
      <span className="form-error-icon">⚠️</span>
      <span className="form-error-text">{message}</span>
    </div>
  )
}
