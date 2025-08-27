'use client'

import { useState } from 'react'

export default function Logo({
  size = 'default',
  showText = true,
  className = '',
  animated = true,
  textColor = 'default', // 'default' or 'white'
  sidebarMode = false, // Special mode for sidebar usage
}) {
  const [isHovered, setIsHovered] = useState(false)

  const sizes = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const textSizes = {
    sm: 'text-sm',
    default: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  const iconSize = {
    sm: 16, // 16px = w-4 h-4
    default: 24, // 24px = w-6 h-6
    lg: 28, // 28px = w-7 h-7
    xl: 40, // 40px = w-10 h-10
  }

  return (
    <div
      className={`flex items-center ${sidebarMode ? 'justify-center' : 'gap-3'} ${className}`}
      onMouseEnter={() => animated && setIsHovered(true)}
      onMouseLeave={() => animated && setIsHovered(false)}
    >
      {/* Logo Icon */}
      <div className="relative">
        <div
          className={`${sizes[size]} bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-500 ${
            animated && isHovered ? 'scale-110 shadow-xl' : ''
          }`}
        >
          {/* Geometric Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

          {/* Animated Background Pattern */}
          {animated && (
            <div
              className={`absolute inset-0 bg-gradient-to-br from-indigo-400/30 via-purple-400/30 to-emerald-400/30 transition-all duration-700 ${
                isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
              }`}
            />
          )}

          <svg
            width={iconSize[size]}
            height={iconSize[size]}
            viewBox="0 0 24 24"
            fill="none"
            className={`relative z-10 transition-all duration-500 ${
              animated && isHovered ? 'scale-110' : ''
            }`}
          >
            {/* Main Path Symbol */}
            <path
              d="M12 2L20 8V16L12 22L4 16V8L12 2Z"
              fill="url(#logoGradient)"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner Path Lines */}
            <path d="M12 6L16 9V15L12 18L8 15V9L12 6Z" fill="white" fillOpacity="0.9" />
            {/* Center Dot */}
            <circle
              cx="12"
              cy="12"
              r="2"
              fill="url(#logoGradient)"
              className={animated ? 'animate-pulse' : ''}
            />
          </svg>

          {/* Gradient Definitions */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Subtle Glow Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl blur-xl scale-110 transition-all duration-700 ${
            animated && isHovered ? 'opacity-80 scale-125' : 'opacity-60 scale-110'
          }`}
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span
              className={`${textSizes[size]} font-bold font-display transition-all duration-500 ${
                animated && isHovered ? 'scale-105' : ''
              } ${
                textColor === 'white'
                  ? 'text-white'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent'
              }`}
            >
              Mentor Path
            </span>
            <div
              className={`w-1 h-1 rounded-full transition-all duration-500 ${
                animated && isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-80'
              } ${
                textColor === 'white'
                  ? 'bg-white'
                  : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
              }`}
            />
          </div>
          <div
            className={`text-xs font-medium tracking-wide ${
              textColor === 'white' ? 'text-white/80' : 'text-slate-500'
            }`}
          >
            Productivity Platform
          </div>
        </div>
      )}
    </div>
  )
}
