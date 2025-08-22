'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import { Trash2, Edit } from 'lucide-react'
import NoteDetailsModal from './NoteDetailsModal'
import ConvertToTaskModal from './ConvertToTaskModal'

export default function NoteCard({ note, onDelete, onConvertToTask, onUpdate }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true)
      try {
        await deleteNote(note.id)
        onDelete?.(note.id)
      } catch (error) {
        console.error('Failed to delete note:', error)
        alert('Failed to delete note')
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

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md
         hover:shadow-lg transition-all duration-200 group cursor-pointer w-full aspect-[1/1] flex flex-col"
        onClick={() => {
          setIsEditing(false)
          setShowDetailsModal(true)
        }}
        title="Click to view note details"
      >
        {/* Header with pushpin icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 hover:text-gray-700 transition-colors">
              {truncateText(note.title, 30)}
            </h3>
          </div>
          <div className="relative -mt-8 -mr-8">
            <img src="/icons/pin.png" alt="Convert to task" className="w-9 h-9" />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 hover:text-gray-900 transition-colors">
            {truncateText(note.description, 120)}
          </p>
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
              >
                {label}
              </span>
            ))}
            {note.labels.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                +{note.labels.length - 3}
              </span>
            )}
          </div>
        )}
        {/* Footer */}
        <div className="flex items-center justify-between ">
          {/* Date */}
          <div className="text-xs text-gray-500 font-medium hover:text-gray-700 transition-colors">
            {formatDate(note.createdAt)}
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
              className="p-1"
              title="Edit note"
            >
              <Edit size={16} />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConvertModal(true)}
              className="p-1"
              title="Convert to Task"
            >
              <img src="/icons/exchange.png" alt="Convert to task" className="w-4 h-4" />
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="p-1"
              title="Delete note"
            >
              <Trash2 size={16} />
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
          onUpdate={onUpdate}
          isEditing={isEditing}
        />
      )}
    </>
  )
}
