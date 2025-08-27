'use client'

import { useState } from 'react'
import { clearEventsForDate } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import { X, Eye, Trash2, Calendar, Clock, FileText, Edit, Link } from 'lucide-react'

export default function DayEventsModal({
  date,
  events,
  isOpen,
  onClose,
  onEventDeleted,
  onViewEvent,
  onEditEvent,
  onDeleteEvent,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Calendar size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">{formattedDate}</h3>
                <p className="text-slate-600 font-body">
                  {events.length} event{events.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="danger"
                onClick={handleClearEvents}
                disabled={isClearing || events.length === 0}
                className="px-6 py-3 rounded-xl font-medium"
              >
                {isClearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Clear All Events
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-slate-200 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={20} className="text-slate-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 font-display mb-3">
                No Events Scheduled
              </h3>
              <p className="text-slate-600 font-body text-lg leading-relaxed max-w-md mx-auto">
                This day is free of scheduled events. You can add new events to keep your calendar
                organized.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Events List */}
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => onViewEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-slate-900 font-body">
                          {event.name}
                        </h4>
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                          {event.time}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-slate-600 font-body mb-4 leading-relaxed line-clamp-5">
                          <div
                            className="prose prose-sm max-w-none text-slate-600"
                            dangerouslySetInnerHTML={{
                              __html:
                                event.description.length > 300
                                  ? event.description.substring(0, 300) + '...'
                                  : event.description,
                            }}
                          />
                        </p>
                      )}

                      {event.link && (
                        <div className="mb-4">
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium text-sm break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link size={14} className="text-blue-500" />
                            {event.link}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewEvent(event)
                        }}
                        className="px-4 py-2 rounded-xl font-medium"
                      >
                        <Eye size={16} className="mr-2" />
                        View
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditEvent(event)
                        }}
                        className="px-4 py-2 rounded-xl font-medium"
                      >
                        <Edit size={18} className="mr-2" />
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this event?')) {
                            onDeleteEvent(event)
                          }
                        }}
                        className="px-4 py-2 rounded-xl font-medium"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
