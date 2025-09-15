'use client'

import { useState, useEffect } from 'react'
import { createHabit, updateHabit, habitCategories, habitIcons } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import Modal from '@/components/ui/Modal'
import UpgradeModal from '@/components/UpgradeModal'
import { Plus, Calendar, Target, Hash, TrendingUp } from 'lucide-react'

export default function AddHabitModal({ open, onClose, habit = null, onSave }) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [streakPeriod, setStreakPeriod] = useState('30')
  const [selectedIcon, setSelectedIcon] = useState('🎯')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [showAllIcons, setShowAllIcons] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

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

    // Show toast for validation errors
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0]
      showToast(firstError, 'error')
    }

    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!user) {
      showToast('Please wait for authentication to complete', 'error')
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
        showToast(`Habit "${name.trim()}" updated successfully!`, 'success')
      } else {
        await createHabit(habitData)
        showToast(`Habit "${name.trim()}" created successfully!`, 'success')
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
        setShowAllIcons(false) // Reset icon view state
      }
    } catch (e) {
      // Check if it's a limit error
      if (e.message && e.message.includes('habit limit')) {
        setShowUpgradeModal(true)
      } else {
        // Only log unexpected errors, not limit errors
        console.error(e)
        const errorMessage = e.message || 'An unexpected error occurred'
        showToast(`Failed to ${isEditing ? 'update' : 'create'} habit: ${errorMessage}`, 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleUpgrade = () => {
    window.location.href = '/mock-payment'
  }

  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false)
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
      </div>

      {/* Habit Icon - New Row */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-1">Habit Icon</label>

        {/* Icon Count Indicator */}
        <div className="mb-3 text-sm text-slate-500">
          Showing {showAllIcons ? habitIcons.length : Math.min(24, habitIcons.length)} of{' '}
          {habitIcons.length} icons
        </div>

        <div className="grid grid-cols-8 gap-2 transition-all duration-500 ease-in-out">
          {habitIcons.slice(0, showAllIcons ? habitIcons.length : 24).map((icon, index) => (
            <button
              key={icon}
              type="button"
              onClick={() => setSelectedIcon(icon)}
              className={`w-12 h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition-all duration-200 ${
                selectedIcon === icon
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              } ${index >= 24 && showAllIcons ? 'animate-fadeIn' : ''}`}
              style={{
                animationDelay: index >= 24 ? `${(index - 24) * 50}ms` : '0ms',
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Visual Separator */}
        {!showAllIcons && habitIcons.length > 24 && (
          <div className="mt-4 mb-2 flex items-center justify-center">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1 max-w-32"></div>
            <span className="px-3 text-xs text-slate-400 font-medium">More icons available</span>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1 max-w-32"></div>
          </div>
        )}

        {/* Collapse/Expand Button */}
        {habitIcons.length > 24 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllIcons(!showAllIcons)}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 font-medium text-slate-700 hover:text-emerald-700 shadow-sm hover:shadow-md"
            >
              <span>{showAllIcons ? 'Collapse Icons' : `View All ${habitIcons.length} Icons`}</span>
              <div
                className={`w-5 h-5 transition-transform duration-300 ${showAllIcons ? 'rotate-180' : ''}`}
              >
                <svg
                  className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}
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
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        header={modalHeader}
        content={modalContent}
        footer={modalFooter}
        size="default"
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleCloseUpgradeModal}
        onUpgrade={handleUpgrade}
        limitType="habits"
        limitCount={3}
        limitPeriod="month"
      />
    </>
  )
}
