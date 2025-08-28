'use client'

import { Tag, X } from 'lucide-react'

export default function LabelBadge({
  label,
  onRemove,
  showRemoveButton = false,
  size = 'default',
}) {
  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }

  // Size variants for delete button
  const buttonSizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Always use the same color variant for consistency
  const colorClasses = 'bg-blue-100 text-blue-700 border-blue-200'
  const colorName = 'blue'

  const baseClasses = `inline-flex items-center gap-2 rounded-xl font-medium border transition-all duration-200 ${sizeClasses[size]} ${colorClasses}`

  return (
    <span className={baseClasses}>
      <Tag
        size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
        className={`text-${colorName}-600`}
      />
      {label}
      {showRemoveButton && onRemove && (
        <button
          onClick={() => onRemove(label)}
          className={`${buttonSizeClasses[size]} rounded-full bg-${colorName}-200 hover:bg-${colorName}-300 flex items-center justify-center transition-colors duration-200`}
          aria-label={`Remove label ${label}`}
        >
          <X
            size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12}
            className={`text-${colorName}-600`}
          />
        </button>
      )}
    </span>
  )
}
