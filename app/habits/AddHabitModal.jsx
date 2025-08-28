'use client'

import { useState, useEffect } from 'react'
import { createHabit, updateHabit, habitCategories, habitIcons } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import Modal from '@/components/ui/Modal'
import { Plus, Calendar, Target, Hash, TrendingUp } from 'lucide-react'

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
    if (!streakPeriod || streakPeriod < 1)
      newErrors.streakPeriod = 'Streak period must be at least 1 day'

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
        icon: selectedIcon,
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

  const modalHeader = {
    icon: <TrendingUp size={24} className="text-emerald-600" />,
    iconBgColor: 'bg-emerald-100',
    title: isEditing ? 'Edit Habit' : 'Add New Habit',
    subtitle: isEditing ? 'Update your habit details' : 'Create a new habit to track',
  }

  const modalContent = (
    <div className="space-y-6">
      {/* Habit Name */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-1">Habit Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name..."
          className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 placeholder-slate-400"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Category and Start Date - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-slate-700"
          >
            <option value="">Select a category</option>
            {habitCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Start Date</label>
          <CustomDatePicker
            value={startDate}
            onChange={(date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const dateString = `${year}-${month}-${day}`
              setStartDate(dateString)
            }}
            name="startDate"
            required
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>
      </div>

      {/* Streak Period and Icon - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">
            Streak Period (days)
          </label>
          <input
            type="number"
            value={streakPeriod}
            onChange={(e) => setStreakPeriod(e.target.value)}
            min="1"
            max="365"
            placeholder="30"
            className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 placeholder-slate-400"
          />
          {errors.streakPeriod && (
            <p className="text-red-500 text-sm mt-1">{errors.streakPeriod}</p>
          )}
        </div>

        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Habit Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {habitIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={`w-12 h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition-all duration-200 ${
                  selectedIcon === icon
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} className="px-6 py-3 rounded-xl font-medium">
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={busy}
        className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {busy ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {isEditing ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          <>
            <Plus size={18} className="mr-2" />
            {isEditing ? 'Update Habit' : 'Create Habit'}
          </>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      header={modalHeader}
      content={modalContent}
      footer={modalFooter}
      size="default"
    />
  )
}
