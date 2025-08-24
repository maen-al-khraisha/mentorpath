'use client'

import { useState } from 'react'
import { clearEventsForDate } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import { X, Eye, Trash2 } from 'lucide-react'

export default function DayEventsModal({
  date,
  events,
  isOpen,
  onClose,
  onEventDeleted,
  onViewEvent,
}) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearEvents = async () => {
    if (
      !confirm(
        `Are you sure you want to clear all events for ${new Date(date).toLocaleDateString()}? This cannot be undone.`
      )
    ) {
      return
    }

    try {
      setIsClearing(true)
      await clearEventsForDate(user.uid, date)
      onEventDeleted()
      onClose()
    } catch (error) {
      console.error('Failed to clear events:', error)
      showToast('Failed to clear events: ' + error.message, 'error')
    } finally {
      setIsClearing(false)
    }
  }

  if (!isOpen) return null

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{formattedDate}</h2>
            <p className="text-sm text-gray-500">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              onClick={handleClearEvents}
              disabled={isClearing || events.length === 0}
              className="flex items-center gap-2"
            >
              {isClearing ? 'Clearing...' : 'Clear Events'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No events scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Headers */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200">
              <div className="col-span-4">
                <span className="text-sm font-medium text-gray-700">Name</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-gray-700">Date/Time</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-gray-700">Description</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-gray-700">Actions</span>
              </div>
            </div>

            {/* Event Rows */}
            {events.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="col-span-4">
                  <span className="text-sm font-medium text-gray-900">{event.name}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-600">{event.time}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-600">
                    {event.description
                      ? event.description.substring(0, 50) +
                        (event.description.length > 50 ? '...' : '')
                      : '-'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewEvent(event)}
                    className="p-2 hover:bg-blue-100 rounded-md transition-colors"
                    title="View event details"
                  >
                    <Eye size={16} className="text-blue-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
