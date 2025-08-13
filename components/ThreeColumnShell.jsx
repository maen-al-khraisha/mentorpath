// components/ThreeColumnShell.jsx
'use client'

import React from 'react'

/**
 * ThreeColumnShell
 * Props:
 *  - left: React node (list)
 *  - center: React node (main content)
 *  - right: React node (details)
 *
 * Behavior:
 *  - Desktop (lg+): show left | center | right
 *  - Medium: show left + center; right becomes overlay (handled by consumer)
 *  - Small: single column; navigation between views handled by routes/consumer
 *
 * Usage:
 * <ThreeColumnShell left={<Left/>} center={<Main/>} right={<Details/>} />
 */

export default function ThreeColumnShell({ left, center, right }) {
  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-[var(--bg-page)]">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'minmax(0, 420px) minmax(0, 1fr) minmax(320px, 380px)',
          }}
        >
          {/* Left column: list (hidden on small screens) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">{left}</div>
          </aside>

          {/* Center */}
          <main id="main" className="min-w-0">
            <div className="space-y-4">{center}</div>
          </main>

          {/* Right column: details */}
          <aside className="hidden xl:block">
            <div className="sticky top-20">{right}</div>
          </aside>
        </div>

        {/* Responsive fallback: show left and right as toggles on medium and small screens */}
        <div className="lg:hidden mt-6">
          {/* When screen small: render left & right below main so consumer can wire modals */}
          <div className="space-y-4">
            {left && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-3 shadow-soft">
                {left}
              </div>
            )}
            {right && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-3 shadow-soft">
                {right}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
