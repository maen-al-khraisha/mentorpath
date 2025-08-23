'use client'

import { useState } from 'react'
import { updateNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Edit2, Save, X as CloseIcon } from 'lucide-react'

export default function NoteDetailsModal({
  isOpen,
  note,
  onClose,
  onUpdate,
  isEditing: initialEditingState = false,
}) {
  const { user, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(initialEditingState)
  const [editedTitle, setEditedTitle] = useState(note?.title || '')
  const [editedDescription, setEditedDescription] = useState(note?.description || '')
  const [editedLabels, setEditedLabels] = useState(note?.labels || [])
  const [labelInput, setLabelInput] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isOpen || !note) return null

  // Reset form when note changes or editing state changes
  useState(() => {
    setEditedTitle(note.title || '')
    setEditedDescription(note.description || '')
    setEditedLabels(note.labels || [])
    setIsEditing(initialEditingState)
  }, [note, initialEditingState])

  const handleSave = async () => {
    if (!user) {
      alert('Please wait for authentication to complete')
      return
    }

    if (!editedTitle.trim()) {
      alert('Please enter a note title')
      return
    }

    try {
      setBusy(true)
      await updateNote(note.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        labels: editedLabels,
      })

      setIsEditing(false)
      onUpdate?.()
      onClose?.()
    } catch (e) {
      console.error(e)
      alert('Failed to update note: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () => {
    setEditedTitle(note.title || '')
    setEditedDescription(note.description || '')
    setEditedLabels(note.labels || [])
    setIsEditing(false)
  }

  const addLabel = () => {
    const v = labelInput.trim()
    if (!v) return
    if (editedLabels.includes(v)) return // Prevent duplicates
    setEditedLabels((ls) => [...ls, v])
    setLabelInput('')
  }

  const removeLabel = (labelToRemove) => {
    setEditedLabels((ls) => ls.filter((l) => l !== labelToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLabel()
    }
  }

  // Format date for display
  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setIsEditing(false)
          onClose?.()
        }}
      />
      <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Note Details</h3>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={busy}
                  className="p-2"
                >
                  <Save size={16} />
                </Button>
              </>
            ) : null}
            <button
              onClick={() => {
                setIsEditing(false)
                onClose?.()
              }}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs text-[var(--neutral-700)] mb-2">Title</label>
            {isEditing ? (
              <input
                className="w-full h-12 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-4 text-lg font-semibold focus:border-[var(--primary)] transition-colors"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Note title"
              />
            ) : (
              <div className="w-full h-12 rounded-lg border-2 border-transparent bg-transparent px-4 text-lg font-semibold">
                {note.title || 'No title'}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[var(--neutral-700)] mb-2">Description</label>
            {isEditing ? (
              <textarea
                className="w-full h-32 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-base focus:border-[var(--primary)] transition-colors resize-none"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Note description"
              />
            ) : (
              <div className="w-full min-h-[8rem] rounded-lg border-2 border-transparent bg-transparent px-4 py-3 text-base">
                {note.description || 'No description'}
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs text-[var(--neutral-700)] mb-2">Labels</label>

            {/* Existing Labels */}
            {editedLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {editedLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                  >
                    {label}
                    {isEditing && (
                      <button
                        onClick={() => removeLabel(label)}
                        className="ml-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                        aria-label={`Remove label ${label}`}
                      >
                        <CloseIcon size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Add New Label (only when editing) */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
                  placeholder="Add label"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addLabel}
                  disabled={!labelInput.trim()}
                  className="h-10 px-3"
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="text-sm text-gray-500">
              <div>Created: {formatDate(note.createdAt)}</div>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div>Last updated: {formatDate(note.updatedAt)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
