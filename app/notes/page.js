'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/useAuth'
import {
  getNotes,
  getAllLabels,
  searchNotes,
  filterNotesByLabel,
  filterNotesByDateRange,
} from '@/lib/notesApi'
import AddNoteModal from './AddNoteModal'
import NoteCard from './NoteCard'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import { useToast } from '@/components/Toast'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  Tag,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  X,
} from 'lucide-react'

export default function NotesPage() {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [notes, setNotes] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [labelFilter, setLabelFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [allLabels, setAllLabels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')

  // Load notes and labels
  useEffect(() => {
    if (!user || loading) {
      setNotes([])
      setAllLabels([])
      setIsLoading(false)
      return
    }

    async function loadData() {
      try {
        setIsLoading(true)
        const [notesData, labelsData] = await Promise.all([
          getNotes(user.uid),
          getAllLabels(user.uid),
        ])
        setNotes(notesData)
        setAllLabels(labelsData)
      } catch (error) {
        console.error('Failed to load notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.uid, loading])

  // Apply filters and search using useMemo for better performance
  const filteredNotes = useMemo(() => {
    let filtered = [...notes]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply label filter
    if (labelFilter !== 'All') {
      filtered = filtered.filter((note) => note.labels.includes(labelFilter))
    }

    // Apply date filter
    if (dateFilter) {
      // Create timezone-safe date comparison
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((note) => {
        const noteDate = new Date(note.createdAt)
        // Compare dates using YYYY-MM-DD format to avoid timezone issues
        const noteDateString = noteDate.toISOString().split('T')[0]
        const filterDateString = filterDate.toISOString().split('T')[0]
        return noteDateString === filterDateString
      })
    }

    return filtered
  }, [notes, searchQuery, labelFilter, dateFilter])

  const handleNoteCreated = async (newNoteId) => {
    // Show success toast
    showToast('Note created successfully!', 'success')

    // Refresh notes after creation
    if (user) {
      try {
        const [notesData, labelsData] = await Promise.all([
          getNotes(user.uid),
          getAllLabels(user.uid),
        ])
        setNotes(notesData)
        setAllLabels(labelsData)
      } catch (error) {
        console.error('Failed to refresh notes:', error)
        showToast('Failed to refresh notes', 'error')
      }
    }
  }

  const handleNoteDeleted = (deletedNoteId, error = null) => {
    if (error) {
      showToast('Failed to delete note', 'error')
      return
    }

    setNotes((prev) => prev.filter((note) => note.id !== deletedNoteId))
    // Show success toast for deletion
    showToast('Note deleted successfully!', 'success')
  }

  const handleNoteConverted = (convertedNoteId, newTaskId) => {
    setNotes((prev) => prev.filter((note) => note.id !== convertedNoteId))
  }

  const handleNoteUpdated = async () => {
    // Refresh notes after update
    if (user) {
      try {
        const [notesData, labelsData] = await Promise.all([
          getNotes(user.uid),
          getAllLabels(user.uid),
        ])
        setNotes(notesData)
        setAllLabels(labelsData)
      } catch (error) {
        console.error('Failed to refresh notes after update:', error)
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLabelFilter('All')
    setDateFilter('')
  }

  // Helper functions for KPIs
  const getTotalNotes = () => notes.length
  const getTotalLabels = () => allLabels.length
  const getRecentNotes = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return notes.filter((note) => new Date(note.createdAt) > oneWeekAgo).length
  }
  const getAverageNoteLength = () => {
    if (notes.length === 0) return 0
    const totalLength = notes.reduce((sum, note) => sum + (note.description?.length || 0), 0)
    return Math.round(totalLength / notes.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">Loading...</div>
          <div className="text-sm text-slate-600 font-body">
            Authenticating and loading your notes
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">
            Authentication Required
          </div>
          <div className="text-sm text-slate-600 font-body">Please sign in to view your notes</div>
        </div>
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
                  Note Management
                </h1>
                <p className="text-xl text-slate-600 font-body leading-relaxed">
                  Capture, organize, and access your thoughts, ideas, and information with ease
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowAdd(true)}
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
              >
                <Plus size={24} className="mr-3" />
                Create Note
              </Button>
            </div>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Notes */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getTotalNotes()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Notes</div>
                    <div className="text-xs text-blue-700 font-medium">Knowledge base</div>
                  </div>
                </div>
              </div>

              {/* Total Labels */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Tag size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getTotalLabels()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Categories</div>
                    <div className="text-xs text-purple-700 font-medium">Organized system</div>
                  </div>
                </div>
              </div>

              {/* Recent Notes */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getRecentNotes()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">This Week</div>
                    <div className="text-xs text-emerald-700 font-medium">Active creation</div>
                  </div>
                </div>
              </div>

              {/* Average Length */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 border border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {getAverageNoteLength()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Avg. Length</div>
                    <div className="text-xs text-amber-700 font-medium">Characters per note</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar - Full Width */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            {/* Date Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-slate-100 transition-all duration-200"
                onClick={() => {
                  const currentDate = dateFilter ? new Date(dateFilter) : new Date()
                  const prevDate = new Date(currentDate.getTime() - 86400000)
                  // Create timezone-safe date string
                  const year = prevDate.getFullYear()
                  const month = String(prevDate.getMonth() + 1).padStart(2, '0')
                  const day = String(prevDate.getDate()).padStart(2, '0')
                  const dateString = `${year}-${month}-${day}`
                  setDateFilter(dateString)
                }}
                aria-label="Previous day"
              >
                <ChevronLeft size={28} className="text-slate-600" />
              </Button>
              <CustomDatePicker
                value={dateFilter ? new Date(dateFilter) : null}
                onChange={(selectedDate) => {
                  // Create a timezone-safe date string (YYYY-MM-DD)
                  const year = selectedDate.getFullYear()
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                  const day = String(selectedDate.getDate()).padStart(2, '0')
                  const dateString = `${year}-${month}-${day}`
                  setDateFilter(dateString)
                }}
                name="mainDate"
                placeholder="Select date"
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-slate-100 transition-all duration-200"
                onClick={() => {
                  const currentDate = dateFilter ? new Date(dateFilter) : new Date()
                  const nextDate = new Date(currentDate.getTime() + 86400000)
                  // Create timezone-safe date string
                  const year = nextDate.getFullYear()
                  const month = String(nextDate.getMonth() + 1).padStart(2, '0')
                  const day = String(nextDate.getDate()).padStart(2, '0')
                  const dateString = `${year}-${month}-${day}`
                  setDateFilter(dateString)
                }}
                aria-label="Next day"
              >
                <ChevronRight size={28} className="text-slate-600" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex-1 flex flex-col sm:flex-row gap-6">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search notes by title, description, or labels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-700"
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                  aria-label="Filter by label"
                >
                  <option value="All">All labels</option>
                  {allLabels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>

                <Button
                  variant="ghost"
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  aria-label="Toggle view mode"
                >
                  <ListTodo size={18} />
                </Button>

                {(searchQuery || labelFilter !== 'All' || dateFilter) && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-xl font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  >
                    <X size={16} className="mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2 text-slate-900 font-display">
                  Loading notes...
                </div>
                <div className="text-sm text-slate-600 font-body">
                  Please wait while we fetch your notes
                </div>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-soft">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 font-display mb-3">
                {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
              </h3>
              <p className="text-slate-600 font-body text-lg leading-relaxed max-w-md mx-auto mb-6">
                {notes.length === 0
                  ? 'Create your first note to start building your knowledge base'
                  : "Try adjusting your search criteria or filters to find what you're looking for"}
              </p>
              {notes.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => setShowAdd(true)}
                  className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Create Your First Note
                </Button>
              )}
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'list'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleNoteDeleted}
                  onConvertToTask={handleNoteConverted}
                  onUpdate={handleNoteUpdated}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showAdd && (
        <AddNoteModal
          open={showAdd}
          onClose={(newNoteId) => {
            setShowAdd(false)
            if (newNoteId) {
              handleNoteCreated(newNoteId)
            }
          }}
        />
      )}

      {/* Toast container is provided globally in RootLayout via ToastProvider */}
    </>
  )
}
