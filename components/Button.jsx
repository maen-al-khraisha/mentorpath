'use client'

export default function Button({
  variant = 'primary',
  size = 'default',
  children,
  className = '',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap'

  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-500 hover:text-gray-700',
    danger: 'text-red-500 hover:text-red-700',
    sketchButton: 'sketch-card sketch-button  text-white p-2 hover:bg-green-700',
  }

  const sizes = {
    default: 'px-3 py-2',
    sm: 'px-2 py-1 text-sm',
    lg: 'px-6 py-4 text-lg',
  }

  const sizeClasses = sizes[size] || sizes.default

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizeClasses} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
