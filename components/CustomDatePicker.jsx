'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Button from './Button'

export default function CustomDatePicker({
  value,
  onChange,
  name,
  label,
  placeholder = 'Select date',
  className = '',
  disabled = false,
  required = false,
  minDate,
  maxDate,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)

  // Update current month when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setCurrentMonth(date)
      setSelectedDate(date)
    }
  }, [value])

  // Recalculate position on window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePopupPosition()
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        calculatePopupPosition()
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    onChange(date)
    setIsOpen(false)
  }

  const calculatePopupPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const popupHeight = 400 // Approximate height of the popup
      const popupWidth = 320 // Width of the popup (w-80 = 320px)

      // Calculate top position
      let top = rect.bottom + 8
      if (top + popupHeight > viewportHeight) {
        // If popup would go below viewport, position it above the button
        top = rect.top - popupHeight - 8
      }

      // Ensure minimum top position
      if (top < 16) {
        top = 16
      }

      // Calculate left position
      let left = rect.left
      if (left + popupWidth > viewportWidth) {
        // If popup would go beyond right edge, align it to the right
        left = viewportWidth - popupWidth - 16
      }

      // Ensure minimum left position
      if (left < 16) {
        left = 16
      }

      setPopupPosition({ top, left })
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true
    if (maxDate && date > new Date(maxDate)) return true
    return false
  }

  const formatDisplayDate = (date) => {
    if (!date) return placeholder
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getISOString = (date) => {
    if (!date) return ''
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      days.push(currentDate)
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className={`relative ${className}`}>
      {/* Hidden input for form submission */}
      {name && (
        <input type="hidden" name={name} value={getISOString(selectedDate)} required={required} />
      )}

      {/* Date Display Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (!disabled) {
              if (!isOpen) {
                calculatePopupPosition()
              }
              setIsOpen(!isOpen)
            }
          }}
          disabled={disabled}
          className={`
              w-full px-6 py-3 bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl text-lg font-semibold text-slate-900 font-display border border-slate-200 cursor-pointer hover:from-slate-200 hover:to-blue-200 transition-all duration-200 shadow-sm text-left
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          aria-label={label || 'Select date'}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Calendar size={20} className="inline mr-3 text-blue-600" />
          {formatDisplayDate(selectedDate)}
        </button>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div
            className="fixed z-[9999] bg-white border border-slate-200 rounded-2xl shadow-2xl w-80 overflow-hidden"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 font-display">Select Date</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="font-semibold text-slate-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString()
                  const isSelected =
                    selectedDate && day.toDateString() === selectedDate.toDateString()
                  const isDisabled = isDateDisabled(day)

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={`
                        p-2 text-sm rounded-lg transition-all
                        ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                        ${isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                        ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                        ${!isCurrentMonth ? 'hover:bg-slate-50' : 'hover:bg-slate-100'}
                        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
