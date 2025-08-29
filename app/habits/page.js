'use client'

import { useState, useEffect } from 'react'
import { getHabits, deleteHabit, habitCategories, subscribeToHabits } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { useToast } from '@/components/Toast'
import AddHabitModal from './AddHabitModal'
import HabitCard from './HabitCard'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import {
  Plus,
  Filter,
  Search,
  TrendingUp,
  Calendar,
  Target,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

export default function HabitsPage() {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [habits, setHabits] = useState([])
  const [filteredHabits, setFilteredHabits] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [collapsedHabits, setCollapsedHabits] = useState(new Set())
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, habit: null })

  // Fetch habits
  useEffect(() => {
    if (user && !loading) {
      fetchHabits()
    }
  }, [user, loading])

  // Set up real-time subscription
  useEffect(() => {
    if (user && !loading) {
      const unsubscribe = subscribeToHabits(user.uid, (updatedHabits) => {
        console.log('Real-time update received:', updatedHabits)
        setHabits(updatedHabits)
      })

      return () => unsubscribe()
    }
  }, [user, loading])

  // Filter and sort habits
  useEffect(() => {
    let filtered = [...habits]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((habit) => habit.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (habit) =>
          habit.name.toLowerCase().includes(query) || habit.category.toLowerCase().includes(query)
      )
    }

    // Sort habits
    switch (sortBy) {
      case 'streak':
        filtered.sort((a, b) => b.currentStreak - a.currentStreak)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'recent':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt?.toDate?.() || b.createdAt) -
            new Date(a.createdAt?.toDate?.() || a.createdAt)
        )
        break
    }

    setFilteredHabits(filtered)
  }, [habits, selectedCategory, searchQuery, sortBy])

  async function fetchHabits() {
    try {
      setIsLoading(true)
      const userHabits = await getHabits(user.uid)
      setHabits(userHabits)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
      showToast('Failed to fetch habits. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  function handleAddHabit() {
    setEditingHabit(null)
    setShowAddModal(true)
  }

  function handleEditHabit(habit) {
    setEditingHabit(habit)
    setShowAddModal(true)
  }

  function handleCloseModal() {
    console.log('handleCloseModal called - setting isModalClosing to true')
    setIsModalClosing(true)
    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      console.log('Animation timeout - hiding modal')
      setShowAddModal(false)
      setIsModalClosing(false)
      setEditingHabit(null)
    }, 600) // Match the animation duration
  }

  function handleHabitSaved() {
    fetchHabits()
  }

  function handleDeleteHabit(habitId) {
    const habit = habits.find((h) => h.id === habitId)
    setDeleteModal({ isOpen: true, habit })
  }

  async function confirmDeleteHabit() {
    try {
      await deleteHabit(deleteModal.habit.id)
      showToast('Habit deleted successfully!', 'success')
      // Refresh habits after deletion
      fetchHabits()
    } catch (error) {
      console.error('Error deleting habit:', error)
      showToast('Failed to delete habit. Please try again.', 'error')
    }
  }

  function closeDeleteModal() {
    setDeleteModal({ isOpen: false, habit: null })
  }

  // Group habits by category for display
  const groupedHabits = filteredHabits.reduce((groups, habit) => {
    const category = habit.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(habit)
    return groups
  }, {})

  // Calculate overall stats
  const totalHabits = habits.length
  const activeHabits = habits.filter((h) => h.isActive).length
  const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0)
  const completedToday = habits.filter((h) => {
    const today = new Date().toISOString().split('T')[0]
    return h.completedDates?.includes(today)
  }).length

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
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
                  Build Lasting Habits
                </h1>
                <p className="text-xl text-slate-600 font-body leading-relaxed">
                  Track your daily routines and build positive habits that stick for life
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleAddHabit}
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
              >
                <Plus size={24} className="mr-3" />
                Create Habit
              </Button>
            </div>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Habits */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {totalHabits}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Habits</div>
                    <div className="text-xs text-emerald-700 font-medium">
                      Building your routine
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Habits */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {activeHabits}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Active Habits</div>
                    <div className="text-xs text-blue-700 font-medium">Currently tracking</div>
                  </div>
                </div>
              </div>

              {/* Total Streaks */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {totalStreaks}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Streaks</div>
                    <div className="text-xs text-purple-700 font-medium">Consistency wins</div>
                  </div>
                </div>
              </div>

              {/* Completed Today */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 border border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {completedToday}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Completed Today</div>
                    <div className="text-xs text-amber-700 font-medium">Daily progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar - Full Width */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search habits by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-700"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {habitCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort habits"
              >
                <option value="recent">Most Recent</option>
                <option value="streak">Highest Streak</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Habits List */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft text-center">
              <div className="text-slate-500">Loading habits...</div>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft text-center">
              <div className="text-slate-500 mb-4">
                {habits.length === 0 ? (
                  <>
                    <div className="text-4xl mb-4">🎯</div>
                    <div className="text-xl font-medium text-slate-700 mb-2">No habits yet!</div>
                    <div className="text-slate-500 mb-4">
                      Start building positive habits to track your progress.
                    </div>
                    <Button variant="primary" onClick={handleAddHabit}>
                      <Plus size={16} className="mr-2" />
                      Add Your First Habit
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-xl font-medium text-slate-700 mb-2">No habits found</div>
                    <div className="text-slate-500">
                      Try adjusting your filters or search terms.
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Add/Edit Habit Modal */}
      {(showAddModal || isModalClosing) && (
        <AddHabitModal
          open={showAddModal}
          habit={editingHabit}
          onClose={handleCloseModal}
          onSave={handleHabitSaved}
        />
      )}
      {console.log('Modal render state:', {
        showAddModal,
        isModalClosing,
        modalOpen: showAddModal && !isModalClosing,
      })}
      {/* Toast container is provided globally in RootLayout via ToastProvider */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteHabit}
        itemName={deleteModal.habit?.name}
      />
    </>
  )
}
