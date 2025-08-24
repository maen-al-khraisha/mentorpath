'use client'

import { useState, useEffect } from 'react'
import { getHabits, deleteHabit, habitCategories, subscribeToHabits } from '@/lib/habitsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { useToast } from '@/components/Toast'
import AddHabitModal from './AddHabitModal'
import HabitCard from './HabitCard'
import { Plus, Filter, Search, TrendingUp, Calendar } from 'lucide-react'

export default function HabitsPage() {
  const { user, loading } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [habits, setHabits] = useState([])
  const [filteredHabits, setFilteredHabits] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [isLoading, setIsLoading] = useState(true)

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
    setShowAddModal(false)
    setEditingHabit(null)
  }

  function handleHabitSaved() {
    fetchHabits()
  }

  const handleDeleteHabit = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
      return
    }

    try {
      await deleteHabit(habitId)
      // Refresh habits after deletion
      fetchHabits()
      showToast('Habit deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting habit:', error)
      showToast('Failed to delete habit. Please try again.', 'error')
    }
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
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <Button variant="primary" onClick={handleAddHabit} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Habit</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{totalHabits}</div>
            <div className="text-sm text-green-700">Total Habits</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{activeHabits}</div>
            <div className="text-sm text-blue-700">Active Habits</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{totalStreaks}</div>
            <div className="text-sm text-purple-700">Total Streaks</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{completedToday}</div>
            <div className="text-sm text-orange-700">Completed Today</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-10 shadow-soft">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Categories</option>
              {habitCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] pl-10 pr-3 text-sm focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="recent">Most Recent</option>
              <option value="streak">Highest Streak</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Habits List */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
          <div className="text-gray-500">Loading habits...</div>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
          <div className="text-gray-500 mb-4">
            {habits.length === 0 ? (
              <>
                <div className="text-4xl mb-4">🎯</div>
                <div className="text-xl font-medium text-gray-700 mb-2">No habits yet!</div>
                <div className="text-gray-500 mb-4">
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
                <div className="text-xl font-medium text-gray-700 mb-2">No habits found</div>
                <div className="text-gray-500">Try adjusting your filters or search terms.</div>
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

      {/* Add/Edit Habit Modal */}
      {showAddModal && (
        <AddHabitModal
          open={showAddModal}
          habit={editingHabit}
          onClose={handleCloseModal}
          onSave={handleHabitSaved}
        />
      )}
      <ToastContainer />
    </div>
  )
}
