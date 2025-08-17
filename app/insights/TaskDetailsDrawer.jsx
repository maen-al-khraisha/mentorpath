'use client'

import { format } from 'date-fns'
import { X, Clock, Tag, CheckCircle, Circle, TrendingUp } from 'lucide-react'

export default function TaskDetailsDrawer({ task, isOpen, onClose }) {
  if (!task) return null

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'Invalid date'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const totalWorkTime = task.workSessions
    ? task.workSessions.reduce((total, session) => total + (session.durationSec || 0), 0)
    : 0

  const completedChecklistItems = task.checklist
    ? task.checklist.filter((item) => item.completed).length
    : 0

  const totalChecklistItems = task.checklist ? task.checklist.length : 0
  const checklistProgress =
    totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* Task Title & Priority */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(task.priority)}`}
              >
                {task.priority} Priority
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock size={16} />
                <span>{formatDuration(totalWorkTime)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Labels</h4>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                  >
                    <Tag size={14} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Checklist</h4>
                <span className="text-sm text-gray-600">
                  {completedChecklistItems}/{totalChecklistItems}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {task.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle size={18} className="text-green-600" />
                    ) : (
                      <Circle size={18} className="text-gray-400" />
                    )}
                    <span
                      className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Log */}
          {task.workSessions && task.workSessions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Work Sessions</h4>
              <div className="space-y-3">
                {task.workSessions.map((session, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Session {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {formatDuration(session.durationSec || 0)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Start:</span> {formatTime(session.startTime)}
                      </div>
                      <div>
                        <span className="font-medium">End:</span> {formatTime(session.endTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <div className="text-gray-600">{formatTime(task.createdAt)}</div>
              </div>
              {task.date && (
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span>
                  <div className="text-gray-600">{formatTime(task.date)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
