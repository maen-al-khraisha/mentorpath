'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

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
  info: {
    icon: Info,
    className: 'bg-indigo-500 text-white border-indigo-600',
    iconClassName: 'text-indigo-100',
  },
}

export function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const { icon: Icon, className, iconClassName } = toastTypes[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-2xl shadow-elevated border transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${className}`}
    >
      <Icon size={20} className={iconClassName} />
      <span className="font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose(), 300)
        }}
        className="ml-2 hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-white/20"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}
