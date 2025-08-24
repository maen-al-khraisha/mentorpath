'use client'

import { useState } from 'react'
import { markHabitCompleted, markHabitIncomplete, deleteHabit } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { useToast } from '@/components/Toast'
import { Edit, Trash2, Check, X } from 'lucide-react'

export default function HabitCard({ habit, onEdit, onUpdate, onDelete }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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
        console.log('Marking day as incomplete:', dateKey)
        await markHabitIncomplete(habit.id, date)
        showToast('Day marked as incomplete', 'info')
      } else {
        // If not completed, mark as complete (check)
        console.log('Marking day as complete:', dateKey)
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
    <div className="bg-[var(--bg-card)] rounded-lg border border-gray-200 shadow-sm p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{habit.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{habit.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isTodayCompleted ? 'secondary' : 'primary'}
            onClick={handleToggleToday}
            disabled={isUpdating}
            className="flex items-center gap-2 px-3 py-2 text-sm"
            title={isTodayCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isTodayCompleted ? '✓ Completed' : 'Mark Complete'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(habit)}
            className="p-2"
            title="Edit habit"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(habit.id)}
            className="p-2"
            title="Delete habit"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{habit.currentStreak}</div>
          <div className="text-xs text-gray-600">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{habit.longestStreak}</div>
          <div className="text-xs text-gray-600">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{habit.totalCompletedDays}</div>
          <div className="text-xs text-gray-600">Total Days</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {habit.totalCompletedDays} / {habit.streakPeriod} days
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(habit.totalCompletedDays / habit.streakPeriod) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Checkboxes */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Habit Days ({habit.streakPeriod} days) - Started{' '}
          {new Date(habit.startDate).toLocaleDateString()}
        </div>

        {/* Weekday Header Row */}
        <div className="flex gap-1 mb-2">
          {habitDays.slice(0, 21).map((day, index) => (
            <div key={`header-${index}`} className="flex-1 text-center min-w-0">
              <div className="text-xs text-gray-500 font-medium truncate">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Day Checkboxes - Organized in rows of 21 */}
        <div className="space-y-2">
          {Array.from({ length: Math.ceil(habitDays.length / 21) }, (_, rowIndex) => {
            const rowDays = habitDays.slice(rowIndex * 21, (rowIndex + 1) * 21)
            const emptySlots = 21 - rowDays.length

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
                      className={`w-6 h-6 rounded-full border-2 ${
                        day.isCompleted
                          ? 'bg-green-500 border-green-600 text-white'
                          : day.isPast
                            ? 'bg-white border-red-500 text-red-500 hover:border-red-600 hover:bg-red-50'
                            : 'border-gray-300 bg-white text-gray-400'
                      } ${
                        day.isPast && !day.isCompleted
                          ? 'hover:bg-red-50 hover:border-red-600 cursor-pointer'
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
                        <Check size={12} />
                      ) : day.isPast ? (
                        <span className="text-xs font-bold text-red-500">+</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </Button>
                  </div>
                ))}

                {/* Empty placeholder slots to maintain alignment */}
                {Array.from({ length: emptySlots }, (_, index) => (
                  <div key={`empty-${index}`} className="flex-1 flex justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-transparent"></div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
