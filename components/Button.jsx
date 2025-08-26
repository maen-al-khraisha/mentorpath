'use client'

import React from 'react'

const Button = React.forwardRef(
  ({ variant = 'primary', size = 'default', children, className = '', onClick, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-300 whitespace-nowrap'

    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-elevated hover:shadow-lg hover:scale-105',
      secondary:
        'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-2xl shadow-soft hover:shadow-lg hover:scale-105',
      ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl',
      danger: 'bg-red-600 text-white hover:bg-red-700 rounded-xl',
    }

    const sizes = {
      default: 'px-6 text-base h-[42px] rounded-2xl',
      sm: 'px-4 h-[32px] text-sm rounded-xl',
      lg: 'px-8 h-[52px] text-lg rounded-2xl',
      xl: 'px-10 h-[62px] text-xl rounded-2xl',
      icon: 'p-0',
    }

    const sizeClasses = sizes[size] || sizes.default

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizeClasses} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
