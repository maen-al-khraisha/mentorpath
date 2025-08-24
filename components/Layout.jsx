'use client'

import { useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MobileBottomNav from '@/components/MobileBottomNav'
import { useSidebar } from '@/lib/SidebarContext'

// Layout: Root layout wrapper composing Sidebar, Header, and content area
// Props:
// - columns: string like "2|1" or "1|2|1" to control main area grid on large screens
// - onPrevDate / onNextDate: optional callbacks passed to Header for date navigation
export default function Layout({ children, columns = '1', onPrevDate, onNextDate }) {
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    openMobileSidebar,
  } = useSidebar()

  // Compute grid template columns from prop for large screens
  const gridColsLg = useMemo(() => {
    const parts = String(columns)
      .split('|')
      .map((p) => p.trim())
    const frs = parts.map((p) => `${Number(p) || 1}fr`).join(' ')
    return frs || '1fr'
  }, [columns])

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-elevated"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onMobileOpen={openMobileSidebar}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={closeMobileSidebar}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            onPrevDate={onPrevDate}
            onNextDate={onNextDate}
            onToggleSidebarMobile={toggleMobileSidebar}
            onToggleSidebarCollapse={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />

          <main id="main" className="flex-1 min-w-0 p-4 md:p-6">
            {/* Responsive columns wrapper. Large screens use custom grid from prop. */}
            <div
              className="grid gap-6 h-full"
              style={{
                gridTemplateColumns: '1fr',
              }}
            >
              <div className="contents lg:block" style={{ display: 'contents' }} />
              {/* On lg and up, we apply the grid template columns */}
              <div
                className="hidden lg:grid overflow-hidden"
                style={{ gridTemplateColumns: gridColsLg, gap: '1.5rem' }}
              >
                {children}
              </div>
              {/* On small/medium, just show children stacked */}
              <div className="lg:hidden overflow-hidden">{children}</div>
            </div>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
