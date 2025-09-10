'use client'

import { useState } from 'react'
import RetroSidebar from './RetroSidebar'
import RetroHeader from './RetroHeader'
import RetroSettingsModal from './RetroSettingsModal'
import TrialBanner from '@/components/TrialBanner'

// Retro Layout: Completely different structure with pixel-art aesthetic
export default function RetroLayout({ children, columns = '1', onPrevDate, onNextDate, user }) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-[#F8F0E3] text-black font-mono">
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] bg-[#D8C4B6] border-2 border-black px-3 py-2"
      >
        Skip to content
      </a>

      {/* Retro Layout Structure */}
      <div className="retro-layout-container">
        {/* Left Sidebar */}
        <RetroSidebar user={user} />

        {/* Main Content Area */}
        <div className="retro-main-content">
          <TrialBanner />
          <RetroHeader
            user={user}
            title="Dashboard"
            subtitle="Your productivity overview"
            onOpenSettings={() => setSettingsModalOpen(true)}
          />

          <main id="main" className="retro-main">
            <div className="retro-content-grid">{children}</div>
          </main>
        </div>
      </div>

      {/* Retro Settings Modal */}
      <RetroSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
      />
    </div>
  )
}
