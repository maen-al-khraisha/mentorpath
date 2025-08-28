'use client'

import { useState, useEffect } from 'react'
import { updateNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Edit2, Save, FileText, Tag, Calendar, Clock } from 'lucide-react'
import LabelBadge from '@/components/LabelBadge'
import { useToast } from '@/components/Toast'
import dynamic from 'next/dynamic'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
      <span className="text-slate-500 font-body">Loading editor...</span>
    </div>
  ),
})

export default function NoteDetailsModal({
  isOpen,
  note,
  onClose,
  onUpdate,
  isEditing: initialEditingState = false,
}) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(initialEditingState)
  const [editedTitle, setEditedTitle] = useState(note?.title || '')
  const [editedDescription, setEditedDescription] = useState(note?.description || '')
  const [editedLabels, setEditedLabels] = useState(note?.labels || [])
  const [labelInput, setLabelInput] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isOpen || !note) return null

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (isOpen) {
      import('react-quill/dist/quill.snow.css')
    }
  }, [isOpen])

  // Reset form when note changes or editing state changes
  useEffect(() => {
    setEditedTitle(note.title || '')
    setEditedDescription(note.description || '')
    setEditedLabels(note.labels || [])
    setIsEditing(initialEditingState)
  }, [note, initialEditingState])

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
    'blockquote',
    'code-block',
  ]

  const handleSave = async () => {
    if (!user) {
      showToast('Please wait for authentication to complete', 'warning')
      return
    }

    if (!editedTitle.trim()) {
      showToast('Please enter a note title', 'warning')
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
      showToast('Note updated successfully!', 'success')
      onUpdate?.()
      onClose?.()
    } catch (e) {
      console.error(e)
      showToast('Failed to update note: ' + e.message, 'error')
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setIsEditing(false)
          onClose?.()
        }}
      />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">Note Details</h3>
                <p className="text-slate-600 font-body">
                  {isEditing ? 'Edit your note' : 'View note information'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsEditing(false)
                onClose?.()
              }}
              aria-label="Close modal"
              className="w-10 h-10 rounded-xl hover:bg-slate-200 transition-all duration-200"
            >
              <X size={20} className="text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-2">Title</label>
            {isEditing ? (
              <input
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-lg font-semibold font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter note title..."
              />
            ) : (
              <div className="w-full h-12 rounded-xl border-2 border-transparent bg-slate-50 px-4 text-lg font-semibold font-body flex items-center">
                {note.title || 'No title'}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-2">Description</label>
            {isEditing ? (
              <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
                <ReactQuill
                  value={editedDescription}
                  onChange={setEditedDescription}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter note description..."
                  className="min-h-[200px]"
                />
              </div>
            ) : (
              <div className="w-full min-h-[8rem] rounded-xl border-2 border-transparent bg-slate-50 px-4 py-3 text-base font-body">
                <div
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: note.description || 'No description' }}
                />
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-2">Labels</label>

            {/* Existing Labels */}
            {editedLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {editedLabels.map((label) => (
                  <LabelBadge
                    key={label}
                    label={label}
                    onRemove={isEditing ? removeLabel : undefined}
                    showRemoveButton={isEditing}
                    size="default"
                  />
                ))}
              </div>
            )}

            {/* Add New Label (only when editing) */}
            {isEditing && (
              <div className="flex items-center gap-3 mb-4">
                <input
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter label name..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant="primary"
                  size="icon"
                  onClick={addLabel}
                  disabled={!labelInput.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-plus"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </Button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Calendar size={18} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">Created</div>
                  <div className="text-sm text-slate-600 font-body">
                    {formatDate(note.createdAt)}
                  </div>
                </div>
              </div>

              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Last Updated</div>
                    <div className="text-sm text-slate-600 font-body">
                      {formatDate(note.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!user || loading || busy || !editedTitle.trim()}
                className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                  </>
                ) : busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Edit2 size={18} className="mr-2" />
              Edit Note
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
