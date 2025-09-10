'use client'

import { useState, useEffect } from 'react'
import { useLayout } from '@/lib/LayoutContext'
import { layoutApi } from '@/lib/layoutApi'

export default function LayoutTester({ user }) {
  const { currentLayout, switchLayout, isTransitioning, availableLayouts } = useLayout()
  const [testResults, setTestResults] = useState({})
  const [isTesting, setIsTesting] = useState(false)

  const runLayoutTests = async () => {
    setIsTesting(true)
    const results = {
      layoutSwitch: { success: false, duration: 0 },
      localStorage: { success: false },
      database: { success: false },
      performance: { success: false, metrics: {} },
    }

    try {
      // Test 1: Layout Switching Performance
      const startTime = performance.now()
      const targetLayout = currentLayout === 'modern' ? 'retro' : 'modern'

      switchLayout(targetLayout)

      // Wait for transition to complete
      await new Promise((resolve) => setTimeout(resolve, 400))

      const endTime = performance.now()
      results.layoutSwitch.duration = endTime - startTime
      results.layoutSwitch.success = true

      // Test 2: LocalStorage Persistence
      const savedLayout = localStorage.getItem('mentorpath-layout')
      results.localStorage.success = savedLayout === targetLayout

      // Test 3: Database Persistence (if user is logged in)
      if (user?.uid) {
        const dbLayout = await layoutApi.getLayoutPreference(user.uid)
        results.database.success = dbLayout === targetLayout
      }

      // Test 4: Performance Metrics
      const memoryUsage = performance.memory
        ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          }
        : null

      results.performance.success = true
      results.performance.metrics = {
        layoutSwitchDuration: results.layoutSwitch.duration,
        memoryUsage,
        isTransitioning,
      }
    } catch (error) {
      console.error('Layout test error:', error)
    }

    setTestResults(results)
    setIsTesting(false)
  }

  const resetLayout = () => {
    switchLayout('modern')
  }

  return (
    <div className="layout-tester">
      <h3>Layout System Tester</h3>

      <div className="tester-controls">
        <button
          onClick={runLayoutTests}
          disabled={isTesting || isTransitioning}
          className="retro-button"
        >
          {isTesting ? 'Running Tests...' : 'Run Layout Tests'}
        </button>

        <button onClick={resetLayout} disabled={isTransitioning} className="retro-button">
          Reset to Modern
        </button>
      </div>

      <div className="tester-status">
        <div className="status-item">
          <span>Current Layout:</span>
          <span className={`status-value ${currentLayout}`}>{currentLayout}</span>
        </div>

        <div className="status-item">
          <span>Transitioning:</span>
          <span className={`status-value ${isTransitioning ? 'true' : 'false'}`}>
            {isTransitioning ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <span>Available Layouts:</span>
          <span className="status-value">{availableLayouts.length}</span>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="test-results">
          <h4>Test Results</h4>

          <div className="result-item">
            <span>Layout Switch:</span>
            <span className={`result ${testResults.layoutSwitch?.success ? 'success' : 'error'}`}>
              {testResults.layoutSwitch?.success ? '✓' : '✗'}
              {testResults.layoutSwitch?.duration?.toFixed(2)}ms
            </span>
          </div>

          <div className="result-item">
            <span>LocalStorage:</span>
            <span className={`result ${testResults.localStorage?.success ? 'success' : 'error'}`}>
              {testResults.localStorage?.success ? '✓' : '✗'}
            </span>
          </div>

          <div className="result-item">
            <span>Database:</span>
            <span className={`result ${testResults.database?.success ? 'success' : 'error'}`}>
              {testResults.database?.success ? '✓' : '✗'}
            </span>
          </div>

          <div className="result-item">
            <span>Performance:</span>
            <span className={`result ${testResults.performance?.success ? 'success' : 'error'}`}>
              {testResults.performance?.success ? '✓' : '✗'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
