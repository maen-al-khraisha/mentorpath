'use client'

import { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'

const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [cssLoaded, setCssLoaded] = useState(false)

  // Dynamically import CSS on client side to avoid build issues
  useEffect(() => {
    const loadCSS = async () => {
      try {
        await import('react-toastify/dist/ReactToastify.css')
        setCssLoaded(true)
      } catch (error) {
        console.warn('Failed to load react-toastify CSS:', error)
        // Continue without CSS - toasts will still work with default styling
        setCssLoaded(true)
      }
    }

    loadCSS()
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const toastOptions = {
      position: 'top-right',
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    }

    switch (type) {
      case 'success':
        toast.success(message, toastOptions)
        break
      case 'error':
        toast.error(message, toastOptions)
        break
      case 'warning':
        toast.warning(message, toastOptions)
        break
      case 'info':
      default:
        toast.info(message, toastOptions)
        break
    }
  }, [])

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
