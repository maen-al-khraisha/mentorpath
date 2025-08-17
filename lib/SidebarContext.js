'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Load persisted collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mentorpath.sidebarCollapsed')
      if (saved != null) setSidebarCollapsed(saved === 'true')
    } catch {}
  }, [])

  // Persist collapse state
  useEffect(() => {
    try {
      localStorage.setItem('mentorpath.sidebarCollapsed', String(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

  // Keyboard shortcut: Ctrl+\ toggles collapse
  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault()
        setSidebarCollapsed((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const toggleSidebar = () => setSidebarCollapsed((v) => !v)
  const toggleMobileSidebar = () => setMobileSidebarOpen((v) => !v)
  const closeMobileSidebar = () => setMobileSidebarOpen(false)
  const openMobileSidebar = () => setMobileSidebarOpen(true)

  const value = {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    openMobileSidebar,
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
