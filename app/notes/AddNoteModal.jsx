'use client'

import { useState } from 'react'
import { createNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Plus } from 'lucide-react'

export default function AddNoteModal({ open, onClose }) {
  const { user, loading } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState([])
  const [labelInput, setLabelInput] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  async function onSave() {
    if (!user) {
      alert('Please wait for authentication to complete')
      return
    }

    if (!title.trim()) {
      alert('Please enter a note title')
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
      onClose?.(id)
      setTitle('')
      setDescription('')
      setLabels([])
    } catch (e) {
      console.error(e)
      alert('Failed to save note: ' + e.message)
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose?.()} />
      <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">add Note</h3>
          <Button variant="ghost" size="icon" onClick={() => onClose?.()} aria-label="Close modal">
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Note Name */}
          <div>
            <input
              className="w-full h-12 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-4 text-base placeholder-gray-500 focus:border-[var(--primary)] transition-colors"
              placeholder="note name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              className="w-full h-32 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-base placeholder-gray-500 focus:border-[var(--primary)] transition-colors resize-none"
              placeholder="note Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Optional Section */}
          <div className="border-t-2 border-[var(--border)] pt-6">
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium text-gray-600 mr-4">Optional</span>
              <div className="flex-1 border-t-2 border-[var(--border)]"></div>
            </div>

            {/* Labels */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Labels</label>

              {/* Existing Labels */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                    >
                      {label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 text-yellow-600 hover:text-yellow-800 transition-colors p-0 h-auto"
                        onClick={() => removeLabel(label)}
                        aria-label={`Remove label ${label}`}
                      >
                        <X size={14} />
                      </Button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Label */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-10 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm placeholder-gray-500 focus:border-[var(--primary)] transition-colors"
                  placeholder="label name"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant="primary"
                  className="h-10 w-10 p-0 rounded-full"
                  onClick={addLabel}
                  disabled={!labelInput.trim()}
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={onSave}
              disabled={busy || !title.trim()}
              className="px-6 py-2"
            >
              {busy ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
