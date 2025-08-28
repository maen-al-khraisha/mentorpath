'use client'

import { useState, useMemo } from 'react'
import { format, isSameDay } from 'date-fns'
import { ChevronDown, ChevronRight, Play, Clock, Tag } from 'lucide-react'
import Button from '@/components/Button'

export default function TaskHistory({ tasks, onTaskSelect, periodDates }) {
  const [expandedDates, setExpandedDates] = useState(new Set())

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups = {}

    tasks.forEach((task) => {
      const taskDate = new Date(task.date || task.createdAt?.toDate())
      const dateKey = taskDate.toISOString().split('T')[0]

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: taskDate,
          tasks: [],
        }
      }

      groups[dateKey].tasks.push(task)
    })

    // Sort by date (newest first)
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, group]) => ({
        dateKey,
        ...group,
      }))
  }, [tasks])

  const toggleDate = (dateKey) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey)
    } else {
      newExpanded.add(dateKey)
    }
    setExpandedDates(newExpanded)
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return '🔥'
      case 'Medium':
        return '⚡'
      case 'Low':
        return '🌱'
      default:
        return '📋'
    }
  }

  if (groupedTasks.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Clock size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            No tasks completed in the selected period. Try adjusting your filters or date range.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Task History</h3>
        <p className="text-sm text-gray-600">Review your completed tasks and work sessions</p>
      </div>

      <div className="space-y-3">
        {groupedTasks.map(({ dateKey, date, tasks }) => {
          const isExpanded = expandedDates.has(dateKey)
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

          return (
            <div key={dateKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Date Header */}
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                onClick={() => toggleDate(dateKey)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-600" />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{format(date, 'EEEE, MMMM d')}</div>
                    <div className="text-sm text-gray-600">
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''} •{' '}
                      {formatDuration(totalWorkTime)} total
                    </div>
                  </div>
                </div>
              </Button>

              {/* Tasks List */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {tasks.map((task) => {
                    const taskWorkTime = task.workSessions
                      ? task.workSessions.reduce(
                          (total, session) => total + (session.durationSec || 0),
                          0
                        )
                      : 0

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                        onClick={() => onTaskSelect(task)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}
                            >
                              {getPriorityIcon(task.priority)}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{formatDuration(taskWorkTime)}</span>
                            </div>

                            {task.labels && task.labels.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag size={14} />
                                <span>{task.labels.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskSelect(task)
                          }}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                          title="View task details"
                        >
                          <Play size={16} />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
