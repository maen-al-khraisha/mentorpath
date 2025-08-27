'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import { Trash2, Edit, FileText, Tag, Clock, Calendar } from 'lucide-react'
import NoteDetailsModal from './NoteDetailsModal'
import ConvertToTaskModal from './ConvertToTaskModal'

export default function NoteCard({ note, onDelete, onConvertToTask, onUpdate, viewMode = 'grid' }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true)
      try {
        // Import deleteNote function dynamically
        const { deleteNote } = await import('@/lib/notesApi')
        await deleteNote(note.id)
        onDelete?.(note.id)
        showToast('Note deleted successfully!', 'success')
      } catch (error) {
        console.error('Failed to delete note:', error)
        showToast('Failed to delete note', 'error')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleConvertToTask = (noteId, taskId) => {
    onConvertToTask?.(noteId, taskId)
  }

  const handleNoteUpdate = () => {
    onUpdate?.()
  }

  // Format date for display
  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now - d)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`

    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    })
  }

  // Truncate text to specified length
  const truncateText = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Get label color based on label name
  const getLabelColor = (label) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
    ]
    const index = label.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-start gap-6">
            {/* Note Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
              <FileText size={24} className="text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 font-body group-hover:text-blue-600 transition-colors leading-tight">
                  {note.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-body">
                  <Clock size={16} className="text-slate-400" />
                  {formatDate(note.createdAt)}
                </div>
              </div>

              <p className="text-slate-600 font-body leading-relaxed mb-4 line-clamp-2">
                {note.description || 'No description provided'}
              </p>

              {/* Labels */}
              {note.labels && note.labels.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {note.labels.slice(0, 4).map((label, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 ${getLabelColor(label)}`}
                    >
                      {label}
                    </span>
                  ))}
                  {note.labels.length > 4 && (
                    <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full border border-slate-300">
                      +{note.labels.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                    setShowDetailsModal(true)
                  }}
                  className="px-4 py-2 rounded-xl font-medium"
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowConvertModal(true)
                  }}
                  className="px-4 py-2 rounded-xl font-medium"
                >
                  <Tag size={16} className="mr-2" />
                  Convert to Task
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl font-medium"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Convert to Task Modal */}
        {showConvertModal && (
          <ConvertToTaskModal
            isOpen={showConvertModal}
            note={note}
            onClose={() => setShowConvertModal(false)}
            onConvert={handleConvertToTask}
          />
        )}

        {/* Note Details Modal */}
        {showDetailsModal && (
          <NoteDetailsModal
            note={note}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setIsEditing(false)
            }}
            onUpdate={handleNoteUpdate}
            isEditing={isEditing}
          />
        )}
      </>
    )
  }

  // Grid view (default)
  return (
    <>
      <div
        className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group w-full aspect-[1/1] flex flex-col"
        onClick={() => {
          setIsEditing(false)
          setShowDetailsModal(true)
        }}
        title="Click to view note details"
      >
        {/* Header with note icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-body">
            <Calendar size={14} className="text-slate-400" />
            {formatDate(note.createdAt)}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 font-body text-base leading-tight group-hover:text-blue-600 transition-colors">
            {truncateText(note.title, 40)}
          </h3>
        </div>

        {/* Description */}
        <div className="mb-4 flex-1">
          <p className="text-slate-600 font-body text-sm leading-relaxed line-clamp-3 group-hover:text-slate-700 transition-colors">
            {truncateText(note.description || 'No description provided', 120)}
          </p>
        </div>

        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.labels.slice(0, 3).map((label, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 text-xs font-semibold rounded-full border ${getLabelColor(label)}`}
              >
                {label}
              </span>
            ))}
            {note.labels.length > 3 && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                +{note.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer with Action Buttons */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
            {note.description ? `${note.description.length} chars` : 'No content'}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsEditing(true)
                setShowDetailsModal(true)
              }}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              title="Edit note"
            >
              <Edit size={16} />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConvertModal(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              title="Convert to Task"
            >
              <Tag size={16} />
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl hover:bg-red-100 transition-colors"
              title="Delete note"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Convert to Task Modal */}
      {showConvertModal && (
        <ConvertToTaskModal
          isOpen={showConvertModal}
          note={note}
          onClose={() => setShowConvertModal(false)}
          onConvert={handleConvertToTask}
        />
      )}

      {/* Note Details Modal */}
      {showDetailsModal && (
        <NoteDetailsModal
          note={note}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setIsEditing(false)
          }}
          onUpdate={handleNoteUpdate}
          isEditing={isEditing}
        />
      )}
    </>
  )
}
