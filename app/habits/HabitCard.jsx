'use client'

import { useState, useEffect } from 'react'
import { markHabitCompleted, markHabitIncomplete, deleteHabit } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { useToast } from '@/components/Toast'
import { Edit, Trash2, Check, X, ChevronDown } from 'lucide-react'

export default function HabitCard({ habit, onEdit, onUpdate, onDelete }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [daysPerRow, setDaysPerRow] = useState(21) // Default for SSR
  const [lastResizeTime, setLastResizeTime] = useState(Date.now()) // Track last resize

  // Calculate responsive days per row with custom 1300px breakpoint
  const calculateDaysPerRow = () => {
    if (typeof window === 'undefined') return 21 // SSR fallback

    const width = window.innerWidth

    let result
    if (width < 640) {
      result = 7 // sm: 7 days (mobile)
    } else if (width < 768) {
      result = 14 // md: 14 days (tablet)
    } else if (width < 1024) {
      result = 21 // lg: 21 days (desktop)
    } else if (width < 1300) {
      result = 14 // 1024px to 1300px: 14 days (tablet/medium desktop)
    } else if (width >= 1300 && width < 1400) {
      result = 14 // 1300px to 1400px: 14 days (custom breakpoint range)
    } else {
      result = 28 // xl+: 28 days (large screens)
    }

    return result
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newDaysPerRow = calculateDaysPerRow()

      // Only update if the days per row actually changed
      if (newDaysPerRow !== daysPerRow) {
        setDaysPerRow(newDaysPerRow)
        setLastResizeTime(Date.now()) // Update timestamp
      } else {
      }
    }

    // Set initial value
    const initialDaysPerRow = calculateDaysPerRow()
    setDaysPerRow(initialDaysPerRow)

    // Add event listener without throttling for immediate response
    window.addEventListener('resize', handleResize)

    // Also trigger on orientation change for mobile
    window.addEventListener('orientationchange', handleResize)

    // Test resize event is working

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [daysPerRow]) // Add daysPerRow as dependency to prevent infinite loops

  // Calculate progress
  const progress = habit.totalCompletedDays / habit.streakPeriod
  const progressPercentage = Math.min(progress * 100, 100)

  // Check if today is completed
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]
  const isTodayCompleted = habit.completedDates?.includes(todayKey)

  // Get habit days for daily checkboxes
  const getHabitDays = () => {
    const days = []
    for (let i = 0; i < habit.streakPeriod; i++) {
      const date = new Date(habit.startDate)
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      days.push({
        date,
        dateKey,
        isCompleted: habit.completedDates?.includes(dateKey) || false,
        isToday: dateKey === todayKey,
        isPast: date <= today,
      })
    }
    return days
  }

  const habitDays = getHabitDays()

  async function handleToggleToday() {
    if (!user || isUpdating) return

    try {
      setIsUpdating(true)
      if (isTodayCompleted) {
        await markHabitIncomplete(habit.id, today)
      } else {
        await markHabitCompleted(habit.id, today)
      }
      onUpdate?.()
    } catch (error) {
      console.error('Failed to toggle habit completion:', error)
      showToast('Failed to update habit: ' + error.message, 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleToggleDay(dateKey) {
    if (!user || isUpdating) return

    try {
      setIsUpdating(true)
      const date = new Date(dateKey)

      // Check if this day is already completed
      if (habit.completedDates?.includes(dateKey)) {
        // If completed, mark as incomplete (uncheck)
        await markHabitIncomplete(habit.id, date)
        showToast('Day marked as incomplete', 'info')
      } else {
        // If not completed, mark as complete (check)
        await markHabitCompleted(habit.id, date)
        showToast('Day marked as complete', 'success')
      }

      // Real-time updates will handle the UI refresh automatically
    } catch (error) {
      console.error('Failed to toggle habit completion:', error)
      showToast('Failed to update habit: ' + error.message, 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{habit.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 font-display">{habit.name}</h3>
            <p className="text-sm text-slate-600 capitalize">{habit.category}</p>
          </div>
          <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
            {habit.currentStreak} day streak
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
            title={isCollapsed ? 'Expand habit details' : 'Collapse habit details'}
          >
            <ChevronDown
              size={20}
              className={`text-slate-500 group-hover:text-emerald-500 transition-all duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </Button>

          <Button
            variant="primary"
            size="icon"
            onClick={() => onEdit(habit)}
            className="p-2 rounded-xl hover:bg-slate-100"
            title="Edit habit"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="danger"
            size="icon"
            onClick={() => onDelete(habit.id)}
            className="p-2 rounded-xl hover:bg-red-50"
            title="Delete habit"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isCollapsed ? 'max-h-0 p-0' : 'max-h-[1000px] p-6'
        }`}
      >
        <div
          className={`space-y-6 ${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        >
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600 font-display">
                {habit.currentStreak}
              </div>
              <div className="text-xs text-green-700 font-medium">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 font-display">
                {habit.longestStreak}
              </div>
              <div className="text-xs text-blue-700 font-medium">Longest Streak</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 font-display">
                {habit.totalCompletedDays}
              </div>
              <div className="text-xs text-purple-700 font-medium">Total Days</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-700">Progress</span>
              <span className="text-sm text-slate-500 font-medium">
                {habit.totalCompletedDays} / {habit.streakPeriod} days
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${(habit.totalCompletedDays / habit.streakPeriod) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Daily Checkboxes */}
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3">
              Habit Days ({habit.streakPeriod} days) - Started{' '}
              {new Date(habit.startDate).toLocaleDateString()}
              <span className="ml-2 text-xs text-gray-500">
                Last resize: {new Date(lastResizeTime).toLocaleTimeString()}
              </span>
              <button
                onClick={() => {
                  const currentWidth = window.innerWidth
                  const currentDays = calculateDaysPerRow()
                  console.log(
                    '📊 Current state - Width:',
                    currentWidth,
                    'Days per row:',
                    currentDays,
                    'State days per row:',
                    daysPerRow
                  )
                }}
                className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Show State
              </button>
            </div>

            {/* Weekday Header Row */}
            <div className="flex gap-1 mb-3">
              {habitDays.slice(0, daysPerRow).map((day, index) => (
                <div key={`header-${index}`} className="flex-1 text-center min-w-0">
                  <div className="text-xs text-slate-500 font-medium truncate">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Day Checkboxes - Organized in dynamic rows */}
            <div className="space-y-2">
              {Array.from({ length: Math.ceil(habitDays.length / daysPerRow) }, (_, rowIndex) => {
                const rowDays = habitDays.slice(rowIndex * daysPerRow, (rowIndex + 1) * daysPerRow)
                const emptySlots = daysPerRow - rowDays.length

                return (
                  <div key={`row-${rowIndex}`} className="flex gap-1">
                    {/* Actual habit days */}
                    {rowDays.map((day, index) => (
                      <div key={day.dateKey} className="flex-1 flex justify-center">
                        <Button
                          variant={day.isCompleted ? 'primary' : day.isPast ? 'secondary' : 'ghost'}
                          size="icon"
                          onClick={() => handleToggleDay(day.dateKey)}
                          disabled={!day.isPast || isUpdating}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                            day.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                              : day.isPast
                                ? 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                : 'border-slate-200 bg-white text-slate-400'
                          } ${
                            day.isPast && !day.isCompleted
                              ? 'hover:bg-slate-50 hover:border-slate-400 cursor-pointer'
                              : day.isPast
                                ? 'cursor-pointer'
                                : 'cursor-default opacity-50'
                          }`}
                          title={
                            day.isPast
                              ? day.isCompleted
                                ? 'Click to uncheck (mark as incomplete)'
                                : 'Click to check (mark as complete) - Day was missed'
                              : `${day.date.toLocaleDateString()} - Future date cannot be modified`
                          }
                        >
                          {day.isCompleted ? (
                            <Check size={14} />
                          ) : day.isPast ? (
                            <span className="text-xs font-bold text-slate-600">+</span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </Button>
                      </div>
                    ))}

                    {/* Empty placeholder slots to maintain alignment */}
                    {Array.from({ length: emptySlots }, (_, index) => (
                      <div key={`empty-${index}`} className="flex-1 flex justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-transparent"></div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
