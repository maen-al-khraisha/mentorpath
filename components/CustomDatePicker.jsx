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
  const [currentMonth, setCurrentMonth] = useState(() => {
    try {
      if (value) {
        let date
        if (value instanceof Date) {
          date = value
        } else if (value.toDate && typeof value.toDate === 'function') {
          date = value.toDate()
        } else {
          date = new Date(value)
        }
        return date && !isNaN(date.getTime()) ? date : new Date()
      }
      return new Date()
    } catch (error) {
      console.error('Error initializing currentMonth:', error)
      return new Date()
    }
  })

  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      let date
      if (value instanceof Date) {
        date = value
      } else if (value.toDate && typeof value.toDate === 'function') {
        date = value.toDate()
      } else {
        date = new Date(value)
      }
      return date && !isNaN(date.getTime()) ? date : null
    }
    return null
  })
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)

  // Update current month when value changes
  useEffect(() => {
    if (value) {
      let date

      // Handle different date formats
      if (value instanceof Date) {
        date = value
      } else if (value.toDate && typeof value.toDate === 'function') {
        // Firestore timestamp
        date = value.toDate()
      } else {
        // Try to create a Date from the value
        date = new Date(value)
      }

      // Validate the date before setting state
      if (date && !isNaN(date.getTime())) {
        setCurrentMonth(date)
        setSelectedDate(date)
      } else {
        // If invalid date, use current date
        const now = new Date()
        setCurrentMonth(now)
        setSelectedDate(now)
      }
    } else {
      // No value provided, use current date
      const now = new Date()
      setCurrentMonth(now)
      setSelectedDate(now)
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
    try {
      const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      if (!isNaN(newMonth.getTime())) {
        setCurrentMonth(newMonth)
      }
    } catch (error) {
      console.error('Error going to previous month:', error)
    }
  }

  const goToNextMonth = () => {
    try {
      const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      if (!isNaN(newMonth.getTime())) {
        setCurrentMonth(newMonth)
      }
    } catch (error) {
      console.error('Error going to next month:', error)
    }
  }

  const isDateDisabled = (date) => {
    if (!date || isNaN(date.getTime())) return false

    try {
      if (minDate) {
        const minDateObj = new Date(minDate)
        if (!isNaN(minDateObj.getTime()) && date < minDateObj) return true
      }
      if (maxDate) {
        const maxDateObj = new Date(maxDate)
        if (!isNaN(maxDateObj.getTime()) && date > maxDateObj) return true
      }
      return false
    } catch (error) {
      console.error('Error checking if date is disabled:', error)
      return false
    }
  }

  const formatDisplayDate = (date) => {
    if (!date) return placeholder

    // Ensure date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date)

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return placeholder
    }

    try {
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting display date:', error)
      return placeholder
    }
  }

  const getISOString = (date) => {
    if (!date) return ''

    // Ensure date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date)

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return ''
    }

    try {
      return dateObj.toISOString().split('T')[0] // YYYY-MM-DD format
    } catch (error) {
      console.error('Error converting date to ISO string:', error)
      return ''
    }
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    try {
      if (!currentMonth || isNaN(currentMonth.getTime())) {
        return []
      }

      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      if (isNaN(firstDay.getTime()) || isNaN(lastDay.getTime())) {
        return []
      }

      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        if (!isNaN(currentDate.getTime())) {
          days.push(currentDate)
        }
      }

      return days
    } catch (error) {
      console.error('Error generating calendar days:', error)
      return []
    }
  }

  // Ensure currentMonth is always valid
  useEffect(() => {
    if (!currentMonth || isNaN(currentMonth.getTime())) {
      console.log('Resetting invalid currentMonth to current date')
      setCurrentMonth(new Date())
    }
  }, [currentMonth])

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
                  {currentMonth && !isNaN(currentMonth.getTime())
                    ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'Invalid Date'}
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
                  try {
                    if (!day || isNaN(day.getTime())) {
                      return (
                        <div key={index} className="p-2 text-sm text-slate-300">
                          -
                        </div>
                      )
                    }

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
                  } catch (error) {
                    console.error('Error rendering calendar day:', error)
                    return (
                      <div key={index} className="p-2 text-sm text-slate-300">
                        -
                      </div>
                    )
                  }
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
