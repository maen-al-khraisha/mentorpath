'use client'

import { X } from 'lucide-react'
import Button from '@/components/Button'
import { useEffect, useState, useRef } from 'react'

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
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const scrollPositionRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position immediately
      scrollPositionRef.current = window.scrollY

      // Hide body scroll immediately to prevent any jumping
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'

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
        // Restore scroll position and body styles
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositionRef.current)
        })
      }, 300) // Reduced from 600ms to 300ms for better UX
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Cleanup function to restore scroll if component unmounts while modal is open
  useEffect(() => {
    return () => {
      if (shouldRender) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollPositionRef.current)
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
      className={`fixed inset-0 z-50 p-4 transition-all duration-300 ease-in-out ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
          isAnimating ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'
        }`}
      />

      {/* Modal container with scale and slide animation */}
      <div
        className={`relative flex items-center justify-center w-full h-full transition-all duration-300 ease-in-out ${
          isAnimating
            ? 'transform scale-100 translate-y-0'
            : 'transform scale-90 translate-y-12 rotate-2'
        }`}
      >
        <div
          className={`bg-white border border-slate-200 rounded-3xl shadow-2xl w-full ${sizeClass} flex flex-col overflow-hidden transition-all duration-300 ease-in-out max-h-[90vh] ${
            isAnimating
              ? 'opacity-100 transform scale-100 translate-y-0 shadow-2xl rotate-0'
              : 'opacity-0 transform scale-75 translate-y-8 shadow-none -rotate-3'
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            transformOrigin: 'center center',
            willChange: 'transform, opacity',
          }}
        >
          {/* Header */}
          {header && (
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex-shrink-0">
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
            className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ease-out modal-content-scroll ${
              isAnimating
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-12 scale-95'
            }`}
            style={{
              transitionDelay: isAnimating ? '300ms' : '150ms',
            }}
          >
            {content}
          </div>

          {/* Footer - Fixed with fade animation */}
          {footer && (
            <div
              className={`px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 flex-shrink-0 transition-all duration-300 ease-out ${
                isAnimating
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-12 scale-95'
              }`}
              style={{
                transitionDelay: isAnimating ? '400ms' : '250ms',
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
