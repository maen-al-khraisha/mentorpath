'use client'

import { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import Button from '@/components/Button'

const toastTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-emerald-500 text-white border-emerald-600',
    iconClassName: 'text-emerald-100',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-500 text-white border-red-600',
    iconClassName: 'text-red-100',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-amber-500 text-white border-amber-600',
    iconClassName: 'text-amber-100',
  },
  info: {
    icon: Info,
    className: 'bg-indigo-500 text-white border-indigo-600',
    iconClassName: 'text-indigo-100',
  },
}

function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const { icon: Icon, className, iconClassName } = toastTypes[type] || toastTypes.info

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-2xl shadow-elevated border transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${className} min-w-[320px] max-w-[400px]`}
    >
      <Icon size={20} className={iconClassName} />
      <span className="font-medium text-sm leading-relaxed">{message}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300)
        }}
        className="ml-auto hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-white/20 flex-shrink-0"
      >
        <X size={18} />
      </Button>
    </div>
  )
}

const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx
}
