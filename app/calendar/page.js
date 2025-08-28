'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToEvents, deleteEvent } from '@/lib/eventsApi'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import AddEventModal from './AddEventModal'
import DayEventsModal from './DayEventsModal'
import EventDetailsModal from './EventDetailsModal'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Search,
  Filter,
  X,
} from 'lucide-react'

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
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('month')

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

  // Week view generation
  const getDaysInWeek = (date) => {
    const current = new Date(date)
    const week = []
    const startOfWeek = new Date(current)
    startOfWeek.setDate(current.getDate() - current.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }

    return week
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return []
    // Create a timezone-safe date string (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
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

  // Handle edit event
  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setOpenInEditMode(true)
    setShowEventModal(true)
    setShowDayModal(false)
  }

  // Handle delete event
  const handleDeleteEvent = async (event) => {
    try {
      await deleteEvent(event.id)
      showToast('Event deleted successfully!', 'success')
      // Refresh events or handle as needed
    } catch (error) {
      console.error('Failed to delete event:', error)
      showToast('Failed to delete event: ' + error.message, 'error')
    }
  }

  // Handle close event details modal
  const handleCloseEventDetails = () => {
    setShowEventModal(false)
    setOpenInEditMode(false) // Reset edit mode
    setShowDayModal(true) // Return to day events modal
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

  // Helper functions for KPIs
  const getTotalEvents = () => events.length
  const getUpcomingEvents = () => {
    const today = new Date()
    // Create a timezone-safe date string for today (YYYY-MM-DD)
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayString = `${year}-${month}-${day}`
    return events.filter((event) => event.date >= todayString).length
  }
  const getEventsThisMonth = () => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    }).length
  }
  const getAverageEventsPerDay = () => {
    if (events.length === 0) return 0
    const uniqueDates = new Set(events.map((event) => event.date))
    return Math.round(events.length / uniqueDates.size)
  }

  // Filter events based on search
  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">Loading...</div>
          <div className="text-sm text-slate-600 font-body">Loading your calendar and events</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">
            Authentication Required
          </div>
          <div className="text-sm text-slate-600 font-body">
            Please sign in to view your calendar
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Hero Section - Page Header & KPIs */}
        <div className="space-y-8">
          {/* Main Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 font-display bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                  Calendar Management
                </h1>
                <p className="text-xl text-slate-600 font-body leading-relaxed">
                  Schedule, organize, and track your events with precision and clarity
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleAddEvent}
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
              >
                <Plus size={24} className="mr-3" />
                Create Event
              </Button>
            </div>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Events */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getTotalEvents()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Events</div>
                    <div className="text-xs text-blue-700 font-medium">All time events</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getUpcomingEvents()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Upcoming</div>
                    <div className="text-xs text-emerald-700 font-medium">Future events</div>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getEventsThisMonth()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">This Month</div>
                    <div className="text-xs text-purple-700 font-medium">{monthName}</div>
                  </div>
                </div>
              </div>

              {/* Average Per Day */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getAverageEventsPerDay()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Avg. Per Day</div>
                    <div className="text-xs text-amber-700 font-medium">Event density</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar - Full Width */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            {/* Date Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-slate-100 transition-all duration-200"
                onClick={
                  viewMode === 'month'
                    ? goToPreviousMonth
                    : () => {
                        const newDate = new Date(currentDate)
                        newDate.setDate(currentDate.getDate() - 7)
                        setCurrentDate(newDate)
                      }
                }
                aria-label={viewMode === 'month' ? 'Previous month' : 'Previous week'}
              >
                <ChevronLeft size={28} className="text-slate-600" />
              </Button>
              <div className="text-center min-w-[200px]">
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  {viewMode === 'month'
                    ? monthName
                    : `Week of ${getDaysInWeek(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-slate-100 transition-all duration-200"
                onClick={
                  viewMode === 'month'
                    ? goToNextMonth
                    : () => {
                        const newDate = new Date(currentDate)
                        newDate.setDate(currentDate.getDate() + 7)
                        setCurrentDate(newDate)
                      }
                }
                aria-label={viewMode === 'month' ? 'Next month' : 'Next week'}
              >
                <ChevronRight size={28} className="text-slate-600" />
              </Button>
            </div>

            {/* Search and Controls */}
            <div className="flex-1 flex flex-col sm:flex-row gap-6">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search events by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={goToToday}
                  className="px-6 py-3 rounded-xl font-medium"
                >
                  Today
                </Button>

                <Button
                  variant="ghost"
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'month'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
                  aria-label="Toggle view mode"
                >
                  <Calendar size={18} />
                </Button>

                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-3 rounded-xl font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  >
                    <X size={16} className="mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
          {viewMode === 'month' ? (
            /* Month View */
            <div className="p-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekdays.map((day) => (
                  <div key={day} className="text-center py-3">
                    <span className="text-sm font-semibold text-slate-700 font-body">{day}</span>
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
                      className={`min-h-[140px] p-3 border-2 border-slate-200 rounded-2xl cursor-pointer transition-all duration-300 ${
                        isToday
                          ? 'bg-blue-50 border-blue-300 shadow-lg ring-2 ring-blue-100'
                          : 'hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
                      } ${!isCurrentMonth ? 'bg-slate-50 border-slate-100' : 'bg-white'}`}
                      onClick={() => handleDayClick(date)}
                    >
                      {date ? (
                        <>
                          {/* Date Header */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-lg font-bold font-display ${
                                isToday ? 'text-blue-600' : 'text-slate-900'
                              }`}
                            >
                              {date.getDate()}
                            </span>
                            {dayEvents.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye size={14} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 font-body">
                                  {dayEvents.length}
                                </span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDate(date)
                                setShowAddModal(true)
                              }}
                              aria-label="Create event for this date"
                            >
                              <Plus size={12} className="text-slate-400 hover:text-emerald-600" />
                            </Button>
                          </div>

                          {/* Events Preview */}
                          <div className="space-y-2">
                            {dayEvents.slice(0, 3).map((event, eventIndex) => (
                              <div
                                key={event.id}
                                className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs p-2 rounded-xl border border-emerald-200 truncate font-medium"
                                title={`${event.time} - ${event.name}`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock size={10} className="text-emerald-600" />
                                  <span className="text-xs font-semibold">{event.time}</span>
                                </div>
                                <div className="truncate">{event.name}</div>
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-slate-500 text-center py-2 bg-slate-100 rounded-lg border border-slate-200 font-medium">
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
          ) : (
            /* Week View */
            <div className="p-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekdays.map((day) => (
                  <div key={day} className="text-center py-3">
                    <span className="text-sm font-semibold text-slate-700 font-body">{day}</span>
                  </div>
                ))}
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInWeek(currentDate).map((date, index) => {
                  const dayEvents = getEventsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isCurrentWeek =
                    date.getTime() >= new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) &&
                    date.getTime() <= new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)

                  return (
                    <div
                      key={index}
                      className={`min-h-[200px] p-3 border-2 border-slate-200 rounded-2xl cursor-pointer transition-all duration-300 ${
                        isToday
                          ? 'bg-blue-50 border-blue-300 shadow-lg ring-2 ring-blue-100'
                          : 'hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
                      } ${!isCurrentWeek ? 'bg-slate-50 border-slate-100' : 'bg-white'}`}
                      onClick={() => handleDayClick(date)}
                    >
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span
                            className={`text-lg font-bold font-display ${
                              isToday ? 'text-blue-600' : 'text-slate-900'
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          <div className="text-xs text-slate-500 font-body">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {dayEvents.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye size={14} className="text-slate-400" />
                              <span className="text-xs font-semibold text-slate-500 font-body">
                                {dayEvents.length}
                              </span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDate(date)
                              setShowAddModal(true)
                            }}
                            aria-label="Create event for this date"
                          >
                            <Plus size={12} className="text-slate-400 hover:text-emerald-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Events Preview */}
                      <div className="space-y-2">
                        {dayEvents.slice(0, 4).map((event, eventIndex) => (
                          <div
                            key={event.id}
                            className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs p-2 rounded-xl border border-emerald-200 truncate font-medium"
                            title={`${event.time} - ${event.name}`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Clock size={10} className="text-emerald-600" />
                              <span className="text-xs font-semibold">{event.time}</span>
                            </div>
                            <div className="truncate">{event.name}</div>
                          </div>
                        ))}
                        {dayEvents.length > 4 && (
                          <div className="text-xs text-slate-500 text-center py-2 bg-slate-100 rounded-lg border border-slate-200 font-medium">
                            +{dayEvents.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onEventCreated={handleEventCreated}
        selectedDate={
          selectedDate
            ? (() => {
                // Create a timezone-safe date string (YYYY-MM-DD)
                const year = selectedDate.getFullYear()
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                const day = String(selectedDate.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
              })()
            : undefined
        }
      />

      <DayEventsModal
        date={
          selectedDate
            ? (() => {
                // Create a timezone-safe date string (YYYY-MM-DD)
                const year = selectedDate.getFullYear()
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                const day = String(selectedDate.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
              })()
            : undefined
        }
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        onEventDeleted={handleEventDeleted}
        onViewEvent={handleViewEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onAddEvent={() => {
          setShowDayModal(false)
          setShowAddModal(true)
        }}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={handleCloseEventDetails}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
        openInEditMode={openInEditMode}
      />

      <ToastContainer />
    </>
  )
}
