'use client'

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}) {
  const base =
    'px-3 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    ghost: 'text-gray-500 hover:text-gray-700 focus:ring-gray-300',
    danger: 'text-red-500 hover:text-red-700 focus:ring-red-400',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}


