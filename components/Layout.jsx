'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MobileBottomNav from '@/components/MobileBottomNav'

// Layout: Root layout wrapper composing Sidebar, Header, and content area
// Props:
// - columns: string like "2|1" or "1|2|1" to control main area grid on large screens
// - onPrevDate / onNextDate: optional callbacks passed to Header for date navigation
export default function Layout({ children, columns = '1', onPrevDate, onNextDate }) {
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

  // Compute grid template columns from prop for large screens
  const gridColsLg = useMemo(() => {
    const parts = String(columns)
      .split('|')
      .map((p) => p.trim())
    const frs = parts.map((p) => `${Number(p) || 1}fr`).join(' ')
    return frs || '1fr'
  }, [columns])

  return (
    <div className="min-h-screen w-full bg-[var(--page)] text-[var(--neutral-900)]">
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-2 shadow"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            onPrevDate={onPrevDate}
            onNextDate={onNextDate}
            onToggleSidebarMobile={() => setMobileSidebarOpen((v) => !v)}
            onToggleSidebarCollapse={() => setSidebarCollapsed((v) => !v)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <main id="main" className="flex-1 min-w-0 p-3 md:p-5">
            {/* Responsive columns wrapper. Large screens use custom grid from prop. */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: '1fr',
              }}
            >
              <div className="contents lg:block" style={{ display: 'contents' }} />
              {/* On lg and up, we apply the grid template columns */}
              <div
                className="hidden lg:grid"
                style={{ gridTemplateColumns: gridColsLg, gap: '1rem' }}
              >
                {children}
              </div>
              {/* On small/medium, just show children stacked */}
              <div className="lg:hidden">{children}</div>
            </div>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
