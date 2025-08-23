'use client'

import { useState, useEffect } from 'react'
import { createHabit, updateHabit, habitCategories, habitIcons } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Plus, Calendar, Target, Hash } from 'lucide-react'

export default function AddHabitModal({ open, onClose, habit = null, onSave }) {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [streakPeriod, setStreakPeriod] = useState('30')
  const [selectedIcon, setSelectedIcon] = useState('🎯')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})

  const isEditing = !!habit

  useEffect(() => {
    if (habit) {
      setName(habit.name || '')
      setCategory(habit.category || '')
      setStartDate(habit.startDate || '')
      setStreakPeriod(habit.streakPeriod?.toString() || '30')
      setSelectedIcon(habit.icon || '🎯')
    } else {
      // Set defaults for new habit
      const today = new Date()
      const formattedDate = today.toISOString().split('T')[0]
      setStartDate(formattedDate)
      setCategory('Productivity')
    }
  }, [habit])

  function validateForm() {
    const newErrors = {}
    
    if (!name.trim()) newErrors.name = 'Habit name is required'
    if (!category) newErrors.category = 'Category is required'
    if (!startDate) newErrors.startDate = 'Start date is required'
    if (!streakPeriod || streakPeriod < 1) newErrors.streakPeriod = 'Streak period must be at least 1 day'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!user) {
      alert('Please wait for authentication to complete')
      return
    }

    if (!validateForm()) return

    try {
      setBusy(true)
      
      const habitData = {
        name: name.trim(),
        category,
        startDate,
        streakPeriod: parseInt(streakPeriod),
        icon: selectedIcon
      }

      if (isEditing) {
        await updateHabit(habit.id, habitData)
      } else {
        await createHabit(habitData)
      }

      onSave?.()
      onClose?.()
      
      // Reset form
      if (!isEditing) {
        setName('')
        setCategory('')
        setStartDate('')
        setStreakPeriod('30')
        setSelectedIcon('🎯')
      }
    } catch (e) {
      console.error(e)
      alert(`Failed to ${isEditing ? 'update' : 'save'} habit: ` + e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose?.()} />
      <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit Habit' : 'Add New Habit'}
          </h3>
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Habit Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name *
            </label>
            <input
              className={`w-full h-12 rounded-lg border-2 ${
                errors.name ? 'border-red-500' : 'border-[var(--border)]'
              } bg-[var(--bg-card)] px-4 text-base placeholder-gray-500 focus:border-[var(--primary)] transition-colors`}
              placeholder="e.g., Morning meditation, Daily reading"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              className={`w-full h-12 rounded-lg border-2 ${
                errors.category ? 'border-red-500' : 'border-[var(--border)]'
              } bg-[var(--bg-card)] px-4 text-base focus:border-[var(--primary)] transition-colors`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {habitCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Start Date and Streak Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  className={`w-full h-12 rounded-lg border-2 ${
                    errors.startDate ? 'border-red-500' : 'border-[var(--border)]'
                  } bg-[var(--bg-card)] pl-10 pr-4 text-base focus:border-[var(--primary)] transition-colors`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Streak Period (days) *
              </label>
              <div className="relative">
                <Target size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="365"
                  className={`w-full h-12 rounded-lg border-2 ${
                    errors.streakPeriod ? 'border-red-500' : 'border-[var(--border)]'
                  } bg-[var(--bg-card)] pl-10 pr-4 text-base focus:border-[var(--primary)] transition-colors`}
                  placeholder="30"
                  value={streakPeriod}
                  onChange={(e) => setStreakPeriod(e.target.value)}
                />
              </div>
              {errors.streakPeriod && (
                <p className="text-red-500 text-sm mt-1">{errors.streakPeriod}</p>
              )}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose an Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {habitIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={busy}
              className="px-6 py-2"
            >
              {busy ? 'Saving...' : (isEditing ? 'Update Habit' : 'Add Habit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
