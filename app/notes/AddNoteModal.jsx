'use client'

import { useState, useEffect } from 'react'
import { createNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import Modal from '@/components/ui/Modal'
import UpgradeModal from '@/components/UpgradeModal'
import { X, Plus, FileText, Tag } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/Toast'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  ),
  onError: (error) => {
    console.error('Failed to load React-Quill:', error)
    return (
      <div className="h-32 bg-red-50 border border-red-200 rounded flex items-center justify-center">
        <span className="text-red-600">Editor failed to load. Please refresh the page.</span>
      </div>
    )
  },
})

export default function AddNoteModal({ open, onClose }) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState([])
  const [labelInput, setLabelInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (open) {
      import('react-quill-new/dist/quill.snow.css')
    }
  }, [open])

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
      const id = await createNote({
        title,
        description,
        labels,
        userId: user.uid,
      })

      // Pass the created note ID to onClose
      onClose?.(id)
      setTitle('')
      setDescription('')
      setLabels([])
    } catch (e) {
      // Check if it's a limit error
      if (e.message.includes('note limit')) {
        setShowUpgradeModal(true)
      } else {
        console.error(e)
        showToast('Failed to save note: ' + e.message, 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  function handleClose() {
    // Reset form when closing without saving
    setTitle('')
    setDescription('')
    setLabels([])
    onClose?.()
  }

  const handleUpgrade = () => {
    window.location.href = '/mock-payment'
  }

  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false)
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

  const header = {
    icon: <FileText size={24} className="text-blue-600" />,
    title: 'Create New Note',
    subtitle: 'Capture your thoughts and ideas in a new note',
    iconBgColor: 'bg-blue-100',
  }

  const content = (
    <div className="space-y-6">
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
              <label className="block text-base font-semibold text-slate-900 mb-1">Labels</label>
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Enter label name..."
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant="primary"
                  size="icon"
                  onClick={addLabel}
                  disabled={!labelInput.trim()}
                >
                  <Plus size={18} />
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
  )

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={handleClose}
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
    </>
  )

  return (
    <>
      <Modal
        isOpen={open}
        onClose={handleClose}
        header={header}
        content={content}
        footer={footer}
        size="large"
        showCloseButton={true}
        closeOnBackdropClick={true}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleCloseUpgradeModal}
        onUpgrade={handleUpgrade}
        limitType="notes"
        limitCount={5}
        limitPeriod="month"
      />
    </>
  )
}
