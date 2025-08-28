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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50">
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
          <Button
            variant={isTodayCompleted ? 'secondary' : 'primary'}
            onClick={handleToggleToday}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
            title={isTodayCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isTodayCompleted ? (
              <>
                <Check size={16} />
                Completed
              </>
            ) : (
              <>
                <Check size={16} />
                Mark Complete
              </>
            )}
          </Button>
          <Button
            variant="ghost"
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
      <div className="p-6 space-y-6">
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
          </div>

          {/* Weekday Header Row */}
          <div className="flex gap-1 mb-3">
            {habitDays.slice(0, 21).map((day, index) => (
              <div key={`header-${index}`} className="flex-1 text-center min-w-0">
                <div className="text-xs text-slate-500 font-medium truncate">
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
  )
}
