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
import { Plus, Search, Filter, Calendar } from 'lucide-react'

export default function NotesPage() {
  const { user, loading } = useAuth()
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [labelFilter, setLabelFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [allLabels, setAllLabels] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load notes and labels
  useEffect(() => {
    if (!user || loading) {
      setNotes([])
      setFilteredNotes([])
      setAllLabels([])
      setIsLoading(false)
      return
    }

    async function loadData() {
      try {
        setIsLoading(true)
        console.log('Loading notes for user:', user.uid)
        const [notesData, labelsData] = await Promise.all([
          getNotes(user.uid),
          getAllLabels(user.uid),
        ])
        console.log('Loaded notes:', notesData)
        console.log('Loaded labels:', labelsData)
        setNotes(notesData)
        setAllLabels(labelsData)
      } catch (error) {
        console.error('Failed to load notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, loading])

  // Apply filters and search
  useEffect(() => {
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
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((note) => {
        const noteDate = new Date(note.createdAt)
        return noteDate.toDateString() === filterDate.toDateString()
      })
    }

    setFilteredNotes(filtered)
  }, [notes, searchQuery, labelFilter, dateFilter])

  const handleNoteCreated = async (newNoteId) => {
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
      }
    }
  }

  const handleNoteDeleted = (deletedNoteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== deletedNoteId))
  }

  const handleNoteConverted = (convertedNoteId, newTaskId) => {
    console.log('Note converted to task:', { noteId: convertedNoteId, taskId: newTaskId })
    setNotes((prev) => prev.filter((note) => note.id !== convertedNoteId))
    // Optionally redirect to tasks page or show success message
    alert(`Note successfully converted to task! Task ID: ${newTaskId}`)
  }

  const handleNoteUpdated = async () => {
    // Refresh notes after update
    if (user) {
      try {
        const [notesData, labelsData] = await Promise.all([
          getNotes(user.uid),
          getAllLabels(user.uid)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading...</div>
          <div className="text-sm text-[var(--neutral-700)]">
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
          <div className="text-lg font-semibold mb-2">Authentication Required</div>
          <div className="text-sm text-[var(--neutral-700)]">Please sign in to view your notes</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Left side - Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Label Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm"
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
              >
                <option value="All">All labels</option>
                {allLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search notes..."
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right side - Add Note button */}
          <div className="flex items-center gap-2">
            {(searchQuery || labelFilter !== 'All' || dateFilter) && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Clear filters
              </Button>
            )}
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              <Plus size={16} />
              <span className="ml-1">add note</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Loading notes...</div>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">
                {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
              </div>
              <div className="text-sm text-[var(--neutral-700)] mb-4">
                {notes.length === 0
                  ? 'Create your first note to get started'
                  : 'Try adjusting your search or filters'}
              </div>
              {notes.length === 0 && (
                <Button variant="primary" onClick={() => setShowAdd(true)}>
                  <Plus size={16} />
                  <span className="ml-1">Create your first note</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleNoteDeleted}
                onConvertToTask={handleNoteConverted}
                onUpdate={handleNoteUpdated}
              />
            ))}
          </div>
        )}
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
    </div>
  )
}
