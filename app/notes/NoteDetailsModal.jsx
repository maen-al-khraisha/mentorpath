'use client'

import { useState, useEffect } from 'react'
import { updateNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import Modal from '@/components/ui/Modal'
import { X, FileText, Tag, Edit3, Save, RotateCcw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/Toast'

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

      showToast('Note updated successfully!', 'success')
      setIsEditing(false)
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update note:', error)
      showToast('Failed to update note: ' + error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedTitle(note.title || '')
    setEditedDescription(note.description || '')
    setEditedLabels(note.labels || [])
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

  const header = {
    icon: <FileText size={24} className="text-blue-600" />,
    title: 'Note Details',
    subtitle: isEditing ? 'Edit your note' : 'View note information',
    iconBgColor: 'bg-blue-100',
  }

  const content = (
    <div className="space-y-6">
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
            {editedLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100 text-blue-700 font-medium text-sm border border-blue-200"
              >
                <Tag size={14} className="text-blue-600" />
                {label}
                {isEditing && (
                  <button
                    onClick={() => removeLabel(label)}
                    className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
                  >
                    <X size={12} className="text-blue-600" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Add New Label - Only show when editing */}
        {isEditing && (
          <div className="flex items-center gap-3">
            <input
              className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="Enter label name..."
              onKeyPress={handleKeyPress}
            />
            <Button variant="primary" size="icon" onClick={addLabel} disabled={!labelInput.trim()}>
              <Tag size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <span className="font-medium">Created:</span> {formatDate(note.createdAt)}
          </div>
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <div>
              <span className="font-medium">Last Updated:</span> {formatDate(note.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const footer = (
    <>
      {isEditing ? (
        <>
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl font-medium"
            disabled={busy}
          >
            <RotateCcw size={18} className="mr-2" />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={busy || !editedTitle.trim()}
            className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {busy ? (
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
        <>
          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl font-medium"
          >
            <Edit3 size={18} className="mr-2" />
            Edit Note
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Close
          </Button>
        </>
      )}
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      content={content}
      footer={footer}
      size="large"
      showCloseButton={true}
      closeOnBackdropClick={true}
    />
  )
}
