import React from 'react'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-description">{description}</div>
      {actionLabel && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
