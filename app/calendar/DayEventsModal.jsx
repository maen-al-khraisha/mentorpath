'use client'

import { useState } from 'react'
import { clearEventsForDate } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { Eye, Trash2, Calendar, Clock, FileText, Edit, Link, Plus } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function DayEventsModal({
  date,
  events,
  isOpen,
  onClose,
  onEventDeleted,
  onViewEvent,
  onEditEvent,
  onDeleteEvent,
  onAddEvent,
}) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isClearing, setIsClearing] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [deleteEventModal, setDeleteEventModal] = useState({ isOpen: false, event: null })

  const handleClearEvents = async () => {
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

  const modalHeader = {
    icon: <Calendar size={24} className="text-emerald-600" />,
    iconBgColor: 'bg-emerald-100',
    title: formattedDate,
    subtitle: `${events.length} event${events.length !== 1 ? 's' : ''} scheduled`,
  }

  const modalContent = (
    <div className="space-y-4">
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
                    <h4 className="text-lg font-semibold text-slate-900 font-body">{event.name}</h4>
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                      {event.time}
                    </span>
                  </div>

                  {event.description && (
                    <div className="text-slate-600 font-body mb-4 leading-relaxed line-clamp-5">
                      <div
                        className="prose prose-sm max-w-none text-slate-600"
                        dangerouslySetInnerHTML={{
                          __html:
                            event.description.length > 300
                              ? event.description.substring(0, 300) + '...'
                              : event.description,
                        }}
                      />
                    </div>
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
                      setDeleteEventModal({ isOpen: true, event })
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
  )

  const modalFooter = (
    <>
      <Button variant="primary" onClick={onAddEvent} className="px-6 py-3 rounded-xl font-medium">
        <Plus size={18} className="mr-2" />
        Add Event
      </Button>
      <Button
        onClick={() => setShowClearModal(true)}
        variant="outline"
        className="px-4 py-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
        disabled={isClearing}
      >
        {isClearing ? (
          <>
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Clearing...
          </>
        ) : (
          <>
            <Trash2 size={16} className="mr-2" />
            Clear All Events
          </>
        )}
      </Button>
    </>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        header={modalHeader}
        content={modalContent}
        footer={modalFooter}
        size="large"
      />

      {/* Clear All Events Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearEvents}
        title="Clear All Events"
        message={`Are you sure you want to clear all events for ${new Date(date).toLocaleDateString()}?`}
        itemName={`${events.length} event${events.length !== 1 ? 's' : ''} on ${new Date(date).toLocaleDateString()}`}
        confirmText="Clear All Events"
        variant="warning"
      />

      {/* Delete Individual Event Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteEventModal.isOpen}
        onClose={() => setDeleteEventModal({ isOpen: false, event: null })}
        onConfirm={() => {
          onDeleteEvent(deleteEventModal.event)
          setDeleteEventModal({ isOpen: false, event: null })
        }}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        itemName={deleteEventModal.event?.name}
        confirmText="Delete Event"
      />
    </>
  )
}
