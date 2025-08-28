'use client'

import { useState, useEffect } from 'react'
import { createNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Plus, FileText, Tag } from 'lucide-react'
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

export default function AddNoteModal({ open, onClose }) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState([])
  const [labelInput, setLabelInput] = useState('')
  const [busy, setBusy] = useState(false)

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (open) {
      import('react-quill/dist/quill.snow.css')
    }
  }, [open])

  if (!open) return null

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

  async function onSave() {
    if (!user) {
      showToast('Please wait for authentication to complete', 'warning')
      return
    }

    if (!title.trim()) {
      showToast('Please enter a note title', 'warning')
      return
    }

    try {
      setBusy(true)
      console.log('Creating note for user:', user.uid)
      const id = await createNote({
        title,
        description,
        labels,
        userId: user.uid,
      })
      console.log('Note created with ID:', id)

      // Show success toast
      showToast(`Note "${title}" created successfully!`, 'success')

      onClose?.(id)
      setTitle('')
      setDescription('')
      setLabels([])
    } catch (e) {
      console.error(e)
      showToast('Failed to save note: ' + e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  function addLabel() {
    const v = labelInput.trim()
    if (!v) return
    if (labels.includes(v)) return // Prevent duplicates
    setLabels((ls) => [...ls, v])
    setLabelInput('')
  }

  function removeLabel(labelToRemove) {
    setLabels((ls) => ls.filter((l) => l !== labelToRemove))
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLabel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose?.()} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">Create New Note</h3>
              <p className="text-slate-600 font-body">
                Capture your thoughts and ideas in a new note
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Basic Note Information */}
          <div className="space-y-6">
            {/* Title and Labels - Half Width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Note Title
                  </label>
                  <input
                    className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                  />
                </div>

                {/* Labels */}
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Labels
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="Enter label name..."
                      onKeyPress={handleKeyPress}
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={addLabel}
                      disabled={!labelInput.trim()}
                      className="px-6 py-3 rounded-xl font-medium"
                    >
                      <Plus size={18} className="mr-2" />
                      Add Label
                    </Button>
                  </div>
                  {labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {labels.map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100 text-blue-700 font-medium text-sm border border-blue-200"
                        >
                          <Tag size={14} className="text-blue-600" />
                          {label}
                          <button
                            onClick={() => setLabels((ls) => ls.filter((_, i) => i !== index))}
                            className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
                          >
                            <X size={12} className="text-blue-600" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note Description - Full Width Below */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-1">
                Note Description
              </label>
              <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Describe your note..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => onClose?.()}
            className="px-6 py-3 rounded-xl font-medium"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!user || loading || busy || !title.trim()}
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
                Creating Note...
              </>
            ) : (
              <>
                <FileText size={18} className="mr-2" />
                Create Note
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
