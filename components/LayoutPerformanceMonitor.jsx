'use client'

import { useState, useEffect } from 'react'
import { useLayout } from '@/lib/LayoutContext'

export default function LayoutPerformanceMonitor() {
  const { currentLayout, isTransitioning } = useLayout()
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState({
    layoutSwitchCount: 0,
    averageSwitchTime: 0,
    memoryUsage: 0,
    lastSwitchTime: 0,
  })

  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Monitor performance metrics
  useEffect(() => {
    if (!isVisible) return

    const updateMetrics = () => {
      const memory = performance.memory
      if (memory) {
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        }))
      }
    }

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [isVisible])

  // Track layout switches
  useEffect(() => {
    if (isTransitioning) {
      const startTime = performance.now()

      const handleTransitionEnd = () => {
        const endTime = performance.now()
        const switchTime = endTime - startTime

        setMetrics((prev) => ({
          ...prev,
          layoutSwitchCount: prev.layoutSwitchCount + 1,
          lastSwitchTime: switchTime,
          averageSwitchTime:
            prev.averageSwitchTime === 0 ? switchTime : (prev.averageSwitchTime + switchTime) / 2,
        }))
      }

      // Wait for transition to complete
      setTimeout(handleTransitionEnd, 350)
    }
  }, [isTransitioning])

  if (!isVisible) return null

  return (
    <div className="layout-performance-monitor active">
      <div className="performance-metric">
        <span className="performance-label">Layout:</span>
        <span className="performance-value">{currentLayout}</span>
      </div>

      <div className="performance-metric">
        <span className="performance-label">Switches:</span>
        <span className="performance-value">{metrics.layoutSwitchCount}</span>
      </div>

      <div className="performance-metric">
        <span className="performance-label">Avg Time:</span>
        <span className="performance-value">{metrics.averageSwitchTime.toFixed(1)}ms</span>
      </div>

      <div className="performance-metric">
        <span className="performance-label">Last Switch:</span>
        <span className="performance-value">{metrics.lastSwitchTime.toFixed(1)}ms</span>
      </div>

      <div className="performance-metric">
        <span className="performance-label">Memory:</span>
        <span className="performance-value">{metrics.memoryUsage}MB</span>
      </div>

      <div className="performance-metric">
        <span className="performance-label">Status:</span>
        <span className={`performance-value ${isTransitioning ? 'true' : 'false'}`}>
          {isTransitioning ? 'Transitioning' : 'Idle'}
        </span>
      </div>
    </div>
  )
}
