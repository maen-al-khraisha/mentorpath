'use client'

export default function Button({ variant = 'primary', children, className = '', ...props }) {
  const base =
    'inline-flex items-center px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap'
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost: 'text-gray-500 hover:text-gray-700',
    danger: 'text-red-500 hover:text-red-700',
    sketchButton: 'sketch-card sketch-button  text-white p-2 hover:bg-green-700',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
