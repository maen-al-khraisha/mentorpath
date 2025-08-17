'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToEvents } from '@/lib/eventsApi'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import AddEventModal from './AddEventModal'
import DayEventsModal from './DayEventsModal'
import EventDetailsModal from './EventDetailsModal'
import { ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react'

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Set up real-time subscription to events
  useEffect(() => {
    if (user && !loading) {
      const unsubscribe = subscribeToEvents(user.uid, (updatedEvents) => {
        setEvents(updatedEvents)
      })

      return () => unsubscribe()
    }
  }, [user, loading])

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Calendar generation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return []
    const dateString = date.toISOString().split('T')[0]
    return events.filter((event) => event.date === dateString)
  }

  // Handle day click
  const handleDayClick = (date) => {
    if (!date) return
    setSelectedDate(date)
    setShowDayModal(true)
  }

  // Handle view event
  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
    setShowDayModal(false)
  }

  // Handle add event
  const handleAddEvent = () => {
    setShowAddModal(true)
  }

  // Handle event created/updated/deleted
  const handleEventCreated = () => {
    // Toast is handled in AddEventModal
  }

  const handleEventUpdated = () => {
    // Toast is handled in EventDetailsModal
  }

  const handleEventDeleted = () => {
    // Toast is handled in EventDetailsModal
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{monthName}</h1>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={goToToday} className="px-4 py-2">
                Today
              </Button>
              <Button
                variant="primary"
                onClick={handleAddEvent}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Plus size={16} />
                Add Event
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekdays.map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-sm font-medium text-gray-700">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isToday = date && date.toDateString() === new Date().toDateString()
              const isCurrentMonth = date && date.getMonth() === currentDate.getMonth()

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  } ${!isCurrentMonth ? 'bg-gray-100' : ''}`}
                  onClick={() => handleDayClick(date)}
                >
                  {date ? (
                    <>
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dayEvents.length > 0 && <Eye size={14} className="text-gray-400" />}
                      </div>

                      {/* Events Preview */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={event.id}
                            className="bg-green-100 text-green-800 text-xs p-1 rounded truncate"
                            title={event.name}
                          >
                            {event.time} {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Modals */}
        <AddEventModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onEventCreated={handleEventCreated}
          selectedDate={selectedDate?.toISOString().split('T')[0]}
        />

        <DayEventsModal
          date={selectedDate?.toISOString().split('T')[0]}
          events={selectedDate ? getEventsForDate(selectedDate) : []}
          isOpen={showDayModal}
          onClose={() => setShowDayModal(false)}
          onEventDeleted={handleEventDeleted}
          onViewEvent={handleViewEvent}
        />

        <EventDetailsModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onEventUpdated={handleEventUpdated}
          onEventDeleted={handleEventDeleted}
        />

        <ToastContainer />
      </div>
    </div>
  )
}
