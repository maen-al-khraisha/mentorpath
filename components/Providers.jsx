'use client'

import { useAuth } from '@/lib/useAuth'
import { SidebarProvider } from '@/lib/SidebarContext'
import { LayoutProvider } from '@/lib/LayoutContext'
import { ToastProvider } from '@/components/Toast'

export default function Providers({ children }) {
  const { user } = useAuth()

  return (
    <ToastProvider>
      <LayoutProvider user={user}>
        <SidebarProvider>{children}</SidebarProvider>
      </LayoutProvider>
    </ToastProvider>
  )
}
