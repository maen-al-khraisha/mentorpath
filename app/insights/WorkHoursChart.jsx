'use client'

import { useMemo } from 'react'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WorkHoursChart({ tasks, periodDates }) {
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: periodDates.start, end: periodDates.end })

    return days.map((day) => {
      const dayKey = day.toISOString().split('T')[0]
      const dayTasks = tasks.filter((task) => {
        let taskDate
        if (task.date) {
          taskDate = new Date(task.date)
        } else if (task.createdAt && typeof task.createdAt.toDate === 'function') {
          taskDate = task.createdAt.toDate()
        } else if (task.createdAt) {
          taskDate = new Date(task.createdAt)
        } else {
          return false
        }

        // Use isSameDay for comparison
        return isSameDay(taskDate, day)
      })

      const totalWorkTime = dayTasks.reduce((total, task) => {
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

      // If no work time but we have tasks, show a minimal bar (0.1 hours) so bars are visible
      const displayHours =
        totalWorkTime > 0
          ? Math.round((totalWorkTime / 3600) * 100) / 100
          : dayTasks.length > 0
            ? 0.1
            : 0

      // Get priority for color coding - find the highest priority task for the day
      let priority = 'low'
      if (dayTasks.length > 0) {
        const priorities = { low: 1, medium: 2, high: 3 }
        priority = dayTasks.reduce((highest, task) => {
          return priorities[task.priority] > priorities[highest] ? task.priority : highest
        }, 'low')
      }

      return {
        date: format(day, 'MMM dd'),
        hours: displayHours,
        priority,
        dayKey,
        dayTasks: dayTasks.length,
        totalWorkTime,
        hasWorkTime: totalWorkTime > 0,
      }
    })
  }, [tasks, periodDates])

  const getBarColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444' // red-500
      case 'medium':
        return '#f59e0b' // amber-500
      case 'low':
        return '#10b981' // emerald-500
      default:
        return '#6b7280' // gray-500
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Work time: <span className="font-semibold">{data.hours}h</span>
          </p>
          <p className="text-xs text-gray-500">Tasks: {data.dayTasks}</p>
          {data.priority && (
            <p className="text-xs text-gray-500 capitalize">Priority: {data.priority}</p>
          )}
          {!data.hasWorkTime && data.dayTasks > 0 && (
            <p className="text-xs text-amber-600">No work sessions recorded</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Work Hours</h3>
        <p className="text-sm text-gray-600">Track your daily productivity and work patterns</p>
      </div>

      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="hours"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.9}
                stroke="#ffffff"
                strokeWidth={1}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.priority)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No data available</div>
              <div className="text-sm">Select a different period or check your task data</div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs text-gray-600">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-gray-600">Low Priority</span>
        </div>
      </div>
    </div>
  )
}

// Cell component for individual bar colors
const Cell = ({ fill }) => <rect fill={fill} />
