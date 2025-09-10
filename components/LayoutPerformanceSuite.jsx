'use client'

import { useState, useEffect } from 'react'
import { useLayout } from '@/lib/LayoutContext'
import { layoutApi } from '@/lib/layoutApi'

export default function LayoutPerformanceSuite({ user }) {
  const { currentLayout, switchLayout, debouncedSwitchLayout, isTransitioning } = useLayout()
  const [testResults, setTestResults] = useState({})
  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  const runPerformanceSuite = async () => {
    setIsRunning(true)
    setTestProgress(0)

    const results = {
      layoutSwitch: { times: [], average: 0, min: 0, max: 0 },
      memoryUsage: { before: 0, after: 0, increase: 0 },
      databasePerformance: { saveTime: 0, loadTime: 0 },
      transitionSmoothness: { fps: 0, jank: 0 },
      overall: { score: 0, grade: '' },
    }

    try {
      // Test 1: Layout Switch Performance (10 iterations)
      setTestProgress(10)
      const switchTimes = []
      for (let i = 0; i < 10; i++) {
        const targetLayout = currentLayout === 'modern' ? 'retro' : 'modern'
        const startTime = performance.now()

        switchLayout(targetLayout)

        await new Promise((resolve) => setTimeout(resolve, 400))

        const endTime = performance.now()
        switchTimes.push(endTime - startTime)

        setTestProgress(10 + (i + 1) * 5)
      }

      results.layoutSwitch.times = switchTimes
      results.layoutSwitch.average = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length
      results.layoutSwitch.min = Math.min(...switchTimes)
      results.layoutSwitch.max = Math.max(...switchTimes)

      // Test 2: Memory Usage
      setTestProgress(60)
      const memoryBefore = performance.memory?.usedJSHeapSize || 0

      // Trigger some layout switches to test memory
      for (let i = 0; i < 5; i++) {
        debouncedSwitchLayout('modern')
        await new Promise((resolve) => setTimeout(resolve, 200))
        debouncedSwitchLayout('retro')
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const memoryAfter = performance.memory?.usedJSHeapSize || 0
      results.memoryUsage.before = Math.round(memoryBefore / 1024 / 1024)
      results.memoryUsage.after = Math.round(memoryAfter / 1024 / 1024)
      results.memoryUsage.increase = results.memoryUsage.after - results.memoryUsage.before

      // Test 3: Database Performance
      setTestProgress(70)
      if (user?.uid) {
        const saveStart = performance.now()
        await layoutApi.saveLayoutPreference(user.uid, currentLayout)
        const saveEnd = performance.now()
        results.databasePerformance.saveTime = saveEnd - saveStart

        const loadStart = performance.now()
        await layoutApi.getLayoutPreference(user.uid)
        const loadEnd = performance.now()
        results.databasePerformance.loadTime = loadEnd - loadStart
      }

      // Test 4: Transition Smoothness
      setTestProgress(80)
      let frameCount = 0
      let lastTime = performance.now()

      const measureFPS = () => {
        frameCount++
        const currentTime = performance.now()

        if (currentTime - lastTime >= 1000) {
          results.transitionSmoothness.fps = frameCount
          frameCount = 0
          lastTime = currentTime
        }

        if (frameCount < 100) {
          requestAnimationFrame(measureFPS)
        }
      }

      requestAnimationFrame(measureFPS)

      // Calculate Overall Score
      setTestProgress(90)
      const switchScore = Math.max(0, 100 - (results.layoutSwitch.average - 50))
      const memoryScore = Math.max(0, 100 - results.memoryUsage.increase * 10)
      const dbScore = user?.uid ? Math.max(0, 100 - results.databasePerformance.saveTime) : 100
      const fpsScore = Math.max(0, results.transitionSmoothness.fps - 30)

      results.overall.score = Math.round((switchScore + memoryScore + dbScore + fpsScore) / 4)
      results.overall.grade =
        results.overall.score >= 90
          ? 'A'
          : results.overall.score >= 80
            ? 'B'
            : results.overall.score >= 70
              ? 'C'
              : results.overall.score >= 60
                ? 'D'
                : 'F'

      setTestProgress(100)
    } catch (error) {
      console.error('Performance suite error:', error)
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const resetToModern = () => {
    switchLayout('modern')
  }

  return (
    <div className="layout-performance-suite">
      <h3>Layout Performance Suite</h3>

      <div className="suite-controls">
        <button
          onClick={runPerformanceSuite}
          disabled={isRunning || isTransitioning}
          className="retro-button"
        >
          {isRunning ? `Running Tests... ${testProgress}%` : 'Run Performance Suite'}
        </button>

        <button onClick={resetToModern} disabled={isTransitioning} className="retro-button">
          Reset to Modern
        </button>
      </div>

      {isRunning && (
        <div className="test-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${testProgress}%` }}></div>
          </div>
          <div className="progress-text">{testProgress}% Complete</div>
        </div>
      )}

      {Object.keys(testResults).length > 0 && (
        <div className="performance-results">
          <h4>Performance Results</h4>

          <div className="result-section">
            <h5>Layout Switching</h5>
            <div className="result-grid">
              <div className="result-item">
                <span>Average Time:</span>
                <span className="result-value">
                  {testResults.layoutSwitch?.average?.toFixed(1)}ms
                </span>
              </div>
              <div className="result-item">
                <span>Min Time:</span>
                <span className="result-value">{testResults.layoutSwitch?.min?.toFixed(1)}ms</span>
              </div>
              <div className="result-item">
                <span>Max Time:</span>
                <span className="result-value">{testResults.layoutSwitch?.max?.toFixed(1)}ms</span>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h5>Memory Usage</h5>
            <div className="result-grid">
              <div className="result-item">
                <span>Before:</span>
                <span className="result-value">{testResults.memoryUsage?.before}MB</span>
              </div>
              <div className="result-item">
                <span>After:</span>
                <span className="result-value">{testResults.memoryUsage?.after}MB</span>
              </div>
              <div className="result-item">
                <span>Increase:</span>
                <span
                  className={`result-value ${testResults.memoryUsage?.increase > 10 ? 'error' : 'success'}`}
                >
                  {testResults.memoryUsage?.increase}MB
                </span>
              </div>
            </div>
          </div>

          {user?.uid && (
            <div className="result-section">
              <h5>Database Performance</h5>
              <div className="result-grid">
                <div className="result-item">
                  <span>Save Time:</span>
                  <span className="result-value">
                    {testResults.databasePerformance?.saveTime?.toFixed(1)}ms
                  </span>
                </div>
                <div className="result-item">
                  <span>Load Time:</span>
                  <span className="result-value">
                    {testResults.databasePerformance?.loadTime?.toFixed(1)}ms
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="result-section">
            <h5>Overall Performance</h5>
            <div className="overall-score">
              <div className="score-display">
                <span className="score-value">{testResults.overall?.score}</span>
                <span className="score-grade">{testResults.overall?.grade}</span>
              </div>
              <div className="score-description">
                {testResults.overall?.score >= 90
                  ? 'Excellent Performance'
                  : testResults.overall?.score >= 80
                    ? 'Good Performance'
                    : testResults.overall?.score >= 70
                      ? 'Average Performance'
                      : testResults.overall?.score >= 60
                        ? 'Below Average'
                        : 'Poor Performance'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
