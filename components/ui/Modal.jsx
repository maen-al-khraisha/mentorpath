'use client'

import { X } from 'lucide-react'
import Button from '@/components/Button'
import { useEffect, useState } from 'react'

export default function Modal({
  isOpen,
  onClose,
  header,
  content,
  footer,
  size = 'default', // 'small', 'default', 'large', 'xl'
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
  position = 'center', // 'center', 'top' - for large modals that need top positioning
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Stop main page scroll when modal opens - use multiple properties for better control
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = '0'
      document.body.style.left = '0'

      setShouldRender(true)
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      // Start closing animation
      setIsAnimating(false)
      // Re-enable body scroll when modal closes
      const timer = setTimeout(() => {
        setShouldRender(false)
        // Restore main page scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.body.style.left = ''
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Cleanup function to restore scroll if component unmounts while modal is open
  useEffect(() => {
    return () => {
      if (shouldRender) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.body.style.left = ''
      }
    }
  }, [shouldRender])

  if (!shouldRender) return null

  const sizeClasses = {
    small: 'max-w-lg',
    default: 'max-w-3xl',
    large: 'max-w-5xl',
    xl: 'max-w-7xl',
  }

  const sizeClass = sizeClasses[size] || sizeClasses.default

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300 ease-in-out ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
      style={{
        display: 'flex',
        alignItems: position === 'top' ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: position === 'top' ? '2rem 1rem 1rem 1rem' : '1rem',
      }}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
          isAnimating ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'
        }`}
      />

      {/* Modal container with proper centering */}
      <div
        className={`relative flex transition-all duration-300 ease-in-out z-[10000] ${
          isAnimating
            ? 'transform scale-100 translate-y-0'
            : 'transform scale-90 translate-y-12 rotate-2'
        }`}
        style={{
          justifyContent: 'center',
          alignItems: position === 'top' ? 'flex-start' : 'center',
          width: 'auto',
          height: 'auto',
        }}
      >
        <div
          className={`bg-white border border-slate-200 rounded-3xl shadow-2xl ${sizeClass} flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isAnimating
              ? 'opacity-100 transform scale-100 translate-y-0 shadow-2xl rotate-0'
              : 'opacity-0 transform scale-75 translate-y-8 shadow-none -rotate-3'
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            transformOrigin: 'center center',
            willChange: 'transform, opacity',
            maxHeight: '90vh',
            width: 'auto',
          }}
        >
          {/* Header */}
          {header && (
            <div
              className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex-shrink-0"
              style={{
                padding: '1.5rem 2rem',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {header.icon && (
                    <div
                      className={`w-12 h-12 ${header.iconBgColor || 'bg-blue-100'} rounded-2xl flex items-center justify-center transition-all duration-300 ease-out ${
                        isAnimating
                          ? 'opacity-100 transform scale-100 rotate-0'
                          : 'opacity-0 transform scale-50 rotate-45'
                      }`}
                      style={{
                        transitionDelay: isAnimating ? '100ms' : '0ms',
                      }}
                    >
                      {header.icon}
                    </div>
                  )}
                  <div
                    className={`transition-all duration-300 ease-out ${
                      isAnimating
                        ? 'opacity-100 transform translate-x-0'
                        : 'opacity-0 transform translate-x-8 scale-95'
                    }`}
                    style={{
                      transitionDelay: isAnimating ? '200ms' : '100ms',
                    }}
                  >
                    <h3 className="text-2xl font-bold text-slate-900 font-display">
                      {header.title}
                    </h3>
                    {header.subtitle && (
                      <p className="text-slate-600 font-body">{header.subtitle}</p>
                    )}
                  </div>
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className={`w-10 h-10 rounded-xl hover:bg-slate-100 transition-all duration-300 ease-out ${
                      isAnimating
                        ? 'opacity-100 transform scale-100 rotate-0'
                        : 'opacity-0 transform scale-75 -rotate-45'
                    }`}
                    style={{
                      transitionDelay: isAnimating ? '300ms' : '200ms',
                    }}
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-slate-600" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Content - Scrollable with fade animation */}
          <div
            className={`transition-all duration-300 ease-out modal-content-scroll ${
              isAnimating
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-12 scale-95'
            }`}
            style={{
              transitionDelay: isAnimating ? '300ms' : '150ms',
              padding: '2rem',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              height: '400px',
              overflowY: 'scroll',
              WebkitOverflowScrolling: 'touch',
              border: '2px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}
          >
            {content}
          </div>

          {/* Footer - Fixed with fade animation */}
          {footer && (
            <div
              className={`bg-slate-50 border-t border-slate-200 flex justify-end gap-4 flex-shrink-0 transition-all duration-300 ease-out ${
                isAnimating
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-12 scale-95'
              }`}
              style={{
                transitionDelay: isAnimating ? '400ms' : '250ms',
                padding: '1.5rem 2rem',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
