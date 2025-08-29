'use client'

import { Clock, TrendingUp, Target } from 'lucide-react'

export default function StatsCards({ tasks, periodDates }) {
  // Calculate peak hours
  const calculatePeakHours = () => {
    const hourCounts = new Array(24).fill(0)

    tasks.forEach((task) => {
      if (task.workSessions) {
        task.workSessions.forEach((session) => {
          if (session.startTime) {
            const startHour = new Date(session.startTime).getHours()
            hourCounts[startHour] += session.durationSec || 0
          }
        })
      }
    })

    const maxHour = hourCounts.indexOf(Math.max(...hourCounts))
    const nextHour = (maxHour + 1) % 24

    return {
      start: maxHour,
      end: nextHour,
      totalTime: hourCounts[maxHour],
    }
  }

  // Calculate best streak
  const calculateBestStreak = () => {
    let currentStreak = 0
    let bestStreak = 0
    let currentDate = new Date(periodDates.start)

    while (currentDate <= periodDates.end) {
      const dateKey = currentDate.toISOString().split('T')[0]
      const dayTasks = tasks.filter((task) => {
        // Try to get a valid date from the task
        let taskDate
        if (task.date) {
          taskDate = new Date(task.date)
          // If task.date is invalid, fall back to createdAt
          if (isNaN(taskDate.getTime())) {
            if (task.createdAt && typeof task.createdAt.toDate === 'function') {
              taskDate = task.createdAt.toDate()
            } else if (task.createdAt) {
              taskDate = new Date(task.createdAt)
            }
          }
        } else if (task.createdAt && typeof task.createdAt.toDate === 'function') {
          taskDate = task.createdAt.toDate()
        } else if (task.createdAt) {
          taskDate = new Date(task.createdAt)
        } else {
          return false // Skip this task
        }

        // Check if we have a valid date
        if (isNaN(taskDate.getTime())) {
          return false // Skip this task
        }

        return taskDate.toISOString().split('T')[0] === dateKey
      })

      const hasWorkTime = dayTasks.some((task) => task.workSessions && task.workSessions.length > 0)

      if (hasWorkTime) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return bestStreak
  }

  // Calculate productivity score
  const calculateProductivityScore = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    const totalWorkTime = tasks.reduce((total, task) => {
      if (task.workSessions) {
        return (
          total +
          task.workSessions.reduce(
            (sessionTotal, session) => sessionTotal + (session.durationSec || 0),
            0
          )
        )
      }
      return total
    }, 0)

    if (totalTasks === 0) return { score: 0, trend: 0 }

    const completionRate = (completedTasks / totalTasks) * 0.6
    const timeEfficiency = Math.min(totalWorkTime / (totalTasks * 3600), 1) * 0.4
    const score = Math.round((completionRate + timeEfficiency) * 10)

    // Mock trend for now (in real app, compare with previous period)
    const trend = Math.floor(Math.random() * 20) - 10 // -10 to +10

    return { score, trend }
  }

  const peakHours = calculatePeakHours()
  const bestStreak = calculateBestStreak()
  const productivity = calculateProductivityScore()

  const formatTime = (hour) => {
    if (hour === 0) return '12AM'
    if (hour < 12) return `${hour}AM`
    if (hour === 12) return '12PM'
    return `${hour - 12}PM`
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Peak Hours Card */}
      <div className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            {formatTime(peakHours.start)} – {formatTime(peakHours.end)}
          </div>
          <div className="text-sm text-gray-600">Most productive time range</div>
          <div className="text-xs text-gray-500">
            {formatDuration(peakHours.totalTime)} total work time
          </div>
        </div>
      </div>

      {/* Best Streak Card */}
      <div className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Best Streak</h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{bestStreak} days</div>
          <div className="text-sm text-gray-600">Longest continuous focus streak</div>
          <div className="text-xs text-gray-500">In the selected period</div>
        </div>
      </div>

      {/* Productivity Score Card */}
      <div className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Productivity</h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{productivity.score}/10</div>
          <div className="text-sm text-gray-600">Overall productivity score</div>
          <div
            className={`text-xs font-medium ${
              productivity.trend > 0
                ? 'text-green-600'
                : productivity.trend < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
            }`}
          >
            {productivity.trend > 0 ? '+' : ''}
            {productivity.trend}% from last period
          </div>
        </div>
      </div>
    </div>
  )
}
