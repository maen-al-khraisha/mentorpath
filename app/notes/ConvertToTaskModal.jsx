'use client'

import { useState } from 'react'
import { createTask } from '@/lib/tasksApi'
import { deleteNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Calendar, Clock } from 'lucide-react'

export default function ConvertToTaskModal({ isOpen, note, onClose, onConvert }) {
  const { user, loading } = useAuth()
  const [title, setTitle] = useState(note?.title || '')
  const [description, setDescription] = useState(note?.description || '')
  const [date, setDate] = useState(new Date())
  const [priority, setPriority] = useState('Medium')
  const [labels, setLabels] = useState(note?.labels || [])
  const [labelInput, setLabelInput] = useState('')
  const [checklist, setChecklist] = useState([])
  const [checkInput, setCheckInput] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isOpen || !note) return null

  async function onSave() {
    if (!user) {
      alert('Please wait for authentication to complete')
      return
    }

    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }

    try {
      setBusy(true)

      // Create the task
      const taskId = await createTask({
        title,
        date,
        description,
        priority,
        labels,
        checklist,
      })

      // Delete the original note
      await deleteNote(note.id)

      // Close modal and notify parent
      onClose?.()
      onConvert?.(note.id, taskId)
    } catch (e) {
      console.error(e)
      alert('Failed to convert note to task: ' + e.message)
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

  function addCheck() {
    const v = checkInput.trim()
    if (!v) return
    setChecklist((ls) => [...ls, { id: crypto.randomUUID(), text: v, done: false }])
    setCheckInput('')
  }

  function removeCheck(checkId) {
    setChecklist((ls) => ls.filter((c) => c.id !== checkId))
  }

  function handleKeyPress(e, type) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'label') addLabel()
      if (type === 'check') addCheck()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
      <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Convert Note to Task</h3>
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Task Details Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Task Details</h4>

            {/* Title */}
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-1">Task name</label>
              <input
                className="w-full h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-1">Description</label>
              <textarea
                className="w-full h-24 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:border-[var(--primary)] transition-colors resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
              />
            </div>

            {/* Date and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">Task date</label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    className="flex-1 h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
                    value={new Date(date).toISOString().slice(0, 10)}
                    onChange={(e) => setDate(new Date(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">Priority</label>
                <div className="flex items-center gap-2">
                  {['High', 'Medium', 'Low'].map((p) => (
                    <label
                      key={p}
                      className={`px-3 h-10 inline-flex items-center rounded-lg border-2 border-[var(--border)] cursor-pointer transition-colors ${priority === p ? 'bg-[var(--primary)] text-[var(--neutral-900)] border-[var(--primary)]' : 'hover:border-[var(--primary)]'}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        className="sr-only"
                        onChange={() => setPriority(p)}
                        checked={priority === p}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-2">Labels</label>

              {/* Existing Labels */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {label}
                      <button
                        onClick={() => removeLabel(label)}
                        className="ml-1 text-green-600 hover:text-green-800 transition-colors"
                        aria-label={`Remove label ${label}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Label */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
                  placeholder="Add label"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'label')}
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
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-2">Checklist</label>

              {/* Existing Checklist Items */}
              {checklist.length > 0 && (
                <div className="space-y-2 mb-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(e) => {
                          setChecklist((prev) =>
                            prev.map((c) =>
                              c.id === item.id ? { ...c, done: e.target.checked } : c
                            )
                          )
                        }}
                        className="rounded border-gray-300"
                      />
                      <span
                        className={`flex-1 text-sm ${item.done ? 'line-through text-gray-500' : ''}`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeCheck(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove checklist item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Checklist Item */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
                  placeholder="Add checklist item"
                  value={checkInput}
                  onChange={(e) => setCheckInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'check')}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addCheck}
                  disabled={!checkInput.trim()}
                  className="h-10 px-3"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={() => onClose?.()} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              disabled={busy || !title.trim()}
              className="px-6 py-2"
            >
              {busy ? 'Converting...' : 'Convert to Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
