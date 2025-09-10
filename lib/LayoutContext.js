'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { layoutApi } from '@/lib/layoutApi'

// Layout configurations
const LAYOUT_CONFIGS = {
  modern: {
    name: 'modern',
    displayName: 'Modern',
    description: 'Clean, contemporary design',
    layout: {
      sidebar: { position: 'left', width: '280px', behavior: 'collapsible' },
      header: { position: 'top', height: '64px', sticky: true },
      content: { maxWidth: '1200px', padding: '24px', grid: 'responsive' },
      modals: { position: 'center', animation: 'fade-in-scale' },
    },
  },
  retro: {
    name: 'retro',
    displayName: 'Retro',
    description: 'Classic pixel-art aesthetic',
    layout: {
      sidebar: { position: 'left', width: '240px', behavior: 'fixed' },
      header: { position: 'top', height: '80px', sticky: false },
      content: { maxWidth: '1000px', padding: '16px', grid: 'fixed' },
      modals: { position: 'left-sidebar', animation: 'slide-in-left' },
    },
  },
}

const LayoutContext = createContext()

export function LayoutProvider({ children, user }) {
  const [currentLayout, setCurrentLayout] = useState('modern')
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Initialize layout from localStorage and sync with database
  useEffect(() => {
    const initializeLayout = async () => {
      try {
        let layout = localStorage.getItem('mentorpath-layout') || 'modern'

        // If user is logged in, sync with database
        if (user?.uid) {
          try {
            const syncedLayout = await layoutApi.syncLayoutPreference(user.uid)
            if (syncedLayout) {
              layout = syncedLayout
            }
          } catch (error) {
            console.warn(
              'Failed to sync layout preference with database, using localStorage:',
              error
            )
            // Continue with localStorage value if database sync fails
          }
        }

        setCurrentLayout(layout)
      } catch (error) {
        console.error('Error initializing layout:', error)
        setCurrentLayout('modern')
      } finally {
        setIsLoading(false)
      }
    }

    initializeLayout()
  }, [user?.uid])

  // Update localStorage and database when layout changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('mentorpath-layout', currentLayout)

      // Add layout class to body
      document.body.classList.remove('layout-modern', 'layout-retro')
      document.body.classList.add(`layout-${currentLayout}`)

      // Save to database if user is logged in
      if (user?.uid && !isTransitioning) {
        layoutApi.saveLayoutPreference(user.uid, currentLayout).catch((error) => {
          console.warn('Failed to save layout preference to database:', error)
          // Continue without throwing error - localStorage is still updated
        })
      }
    }
  }, [currentLayout, isLoading, user?.uid, isTransitioning])

  const switchLayout = (layoutName) => {
    if (LAYOUT_CONFIGS[layoutName] && layoutName !== currentLayout && !isTransitioning) {
      setIsTransitioning(true)

      // Add transition class to body
      document.body.classList.add('layout-transition', 'layout-switch-animation')

      // Update layout after a brief delay for smooth transition
      setTimeout(() => {
        setCurrentLayout(layoutName)
        setIsTransitioning(false)

        // Remove transition classes after animation completes
        setTimeout(() => {
          document.body.classList.remove('layout-transition', 'layout-switch-animation')
        }, 300)
      }, 50)
    }
  }

  // Debounced layout switch for rapid changes
  const debouncedSwitchLayout = (() => {
    let timeoutId = null
    return (layoutName) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        switchLayout(layoutName)
      }, 100)
    }
  })()

  const getLayoutConfig = (layoutName = currentLayout) => {
    return LAYOUT_CONFIGS[layoutName] || LAYOUT_CONFIGS.modern
  }

  const isLayout = (layoutName) => {
    return currentLayout === layoutName
  }

  const availableLayouts = Object.values(LAYOUT_CONFIGS)

  const value = {
    currentLayout,
    switchLayout,
    debouncedSwitchLayout,
    getLayoutConfig,
    isLayout,
    availableLayouts,
    isLoading,
    isTransitioning,
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
