'use client'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-green-600 text-white hover:bg-green-700 ',
        secondary:
          'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md active:from-gray-200 active:to-gray-300 active:shadow-inner transition-all duration-150',
        boder:
          'border border-green-500 text-green-600 bg-transparent rounded-sm px-3 py-1.5 font-medium hover:bg-green-50 hover:border-green-600 hover:text-green-700 active:bg-green-100 transition-colors duration-150 focus:outline-none',

        ghost: 'text-gray-500 hover:text-gray-700 ',
        danger: 'text-red-500 hover:text-red-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
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
