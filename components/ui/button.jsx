'use client'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-300 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-elevated hover:shadow-lg hover:scale-105',
        secondary:
          'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-2xl shadow-soft hover:shadow-lg hover:scale-105',
        ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl',
        danger: 'bg-red-600 text-white hover:bg-red-700 rounded-xl',
        border:
          'border border-indigo-500 text-indigo-600 bg-transparent rounded-xl hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-700',
      },
      size: {
        default: 'px-6 py-3 text-base',
        sm: 'px-4 py-2 text-sm',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
        icon: 'w-10 h-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
