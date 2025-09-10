'use client'

import { useLayout } from '@/lib/LayoutContext'
import { Suspense, lazy, useEffect, useState, useMemo } from 'react'

// Lazy load layout components with preloading
const ModernLayout = lazy(() => import('./layouts/ModernLayout'))
const RetroLayout = lazy(() => import('./layouts/RetroLayout'))

// Layout cache for instant switching
const layoutCache = new Map()

// Preload function for better performance
const preloadLayout = (layoutName) => {
  switch (layoutName) {
    case 'modern':
      import('./layouts/ModernLayout')
      break
    case 'retro':
      import('./layouts/RetroLayout')
      break
    default:
      break
  }
}

// Loading component with retro styling
const LayoutLoading = () => (
  <div className="min-h-screen bg-[var(--retro-bg)] flex items-center justify-center">
    <div className="retro-card p-8 text-center">
      <div className="retro-loading-spinner mb-4"></div>
      <div className="text-[var(--retro-text)] font-mono">Loading layout...</div>
    </div>
  </div>
)

export default function LayoutAware({ children, ...props }) {
  const { currentLayout, isLoading, isTransitioning, availableLayouts, debouncedSwitchLayout } =
    useLayout()
  const [preloadedLayouts, setPreloadedLayouts] = useState(new Set(['modern']))
  const [cachedLayouts, setCachedLayouts] = useState(new Set())

  // Preload other layouts when component mounts
  useEffect(() => {
    availableLayouts.forEach((layout) => {
      if (layout.name !== currentLayout && !preloadedLayouts.has(layout.name)) {
        preloadLayout(layout.name)
        setPreloadedLayouts((prev) => new Set([...prev, layout.name]))
      }
    })
  }, [availableLayouts, currentLayout, preloadedLayouts])

  // Cache current layout for instant switching
  useEffect(() => {
    if (!isLoading && currentLayout) {
      setCachedLayouts((prev) => new Set([...prev, currentLayout]))
    }
  }, [currentLayout, isLoading])

  // Preload layout on hover for better UX
  const handleLayoutHover = (layoutName) => {
    if (!preloadedLayouts.has(layoutName)) {
      preloadLayout(layoutName)
      setPreloadedLayouts((prev) => new Set([...prev, layoutName]))
    }
  }

  // Memoized layout components for better performance
  const layoutComponents = useMemo(
    () => ({
      modern: ModernLayout,
      retro: RetroLayout,
    }),
    []
  )

  // Optimized layout switching
  const handleLayoutSwitch = (layoutName) => {
    if (cachedLayouts.has(layoutName)) {
      // Instant switch for cached layouts
      debouncedSwitchLayout(layoutName)
    } else {
      // Normal switch for uncached layouts
      debouncedSwitchLayout(layoutName)
    }
  }

  if (isLoading) {
    return <LayoutLoading />
  }

  const CurrentLayout = layoutComponents[currentLayout]

  return (
    <Suspense fallback={<LayoutLoading />}>
      <div className={`layout-optimized ${isTransitioning ? 'layout-transition' : ''}`}>
        <CurrentLayout {...props} onLayoutHover={handleLayoutHover}>
          {children}
        </CurrentLayout>
      </div>
    </Suspense>
  )
}
