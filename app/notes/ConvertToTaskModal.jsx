'use client'

import { useState } from 'react'
import { createTask } from '@/lib/tasksApi'
import { deleteNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import { X, Calendar, Clock, Target, Tag, CheckSquare, FileText } from 'lucide-react'

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return '🔥'
      case 'Medium':
        return '⚡'
      case 'Low':
        return '🌱'
      default:
        return '📋'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => onClose?.()} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-green-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">
                Convert Note to Task
              </h3>
              <p className="text-slate-600 font-body">
                Transform your note into an actionable task
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Original Note Preview */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Original Note</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">{note.title}</h4>
            <p className="text-sm text-slate-600 font-body">
              {note.description || 'No description'}
            </p>
            {note.labels && note.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Task Details Form */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-slate-900 font-display flex items-center gap-3">
              <Target size={20} className="text-green-600" />
              Task Details
            </h4>

            {/* Title and Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Task Title
                  </label>
                  <input
                    className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full h-32 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Date and Priority */}
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Task Date
                  </label>
                  <CustomDatePicker
                    value={date}
                    onChange={(selectedDate) => setDate(selectedDate)}
                    name="taskDate"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Priority Level
                  </label>
                  <div className="flex items-center gap-3">
                    {['High', 'Medium', 'Low'].map((p) => (
                      <label
                        key={p}
                        className={`px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium ${
                          priority === p
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          className="sr-only"
                          onChange={() => setPriority(p)}
                          checked={priority === p}
                        />
                        {getPriorityIcon(p)} {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <Tag size={18} className="text-slate-600" />
                Labels
              </label>

              {/* Existing Labels */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-700 border border-green-200"
                    >
                      <Tag size={14} className="text-green-600" />
                      {label}
                      <button
                        onClick={() => removeLabel(label)}
                        className="w-5 h-5 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center transition-colors duration-200"
                        aria-label={`Remove label ${label}`}
                      >
                        <X size={12} className="text-green-600" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Label */}
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter label name..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'label')}
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={addLabel}
                  disabled={!labelInput.trim()}
                  className="px-6 py-3 rounded-xl font-medium"
                >
                  <Tag size={18} className="mr-2" />
                  Add Label
                </Button>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <CheckSquare size={18} className="text-slate-600" />
                Checklist
              </label>

              {/* Existing Checklist Items */}
              {checklist.length > 0 && (
                <div className="space-y-3 mb-4">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
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
                        className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 focus:ring-2"
                      />
                      <span
                        className={`flex-1 text-sm font-medium ${
                          item.done ? 'line-through text-slate-500' : 'text-slate-700'
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeCheck(item.id)}
                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                        aria-label="Remove checklist item"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Checklist Item */}
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter checklist item..."
                  value={checkInput}
                  onChange={(e) => setCheckInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'check')}
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={addCheck}
                  disabled={!checkInput.trim()}
                  className="px-6 py-3 rounded-xl font-medium"
                >
                  <CheckSquare size={18} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => onClose?.()}
            disabled={busy}
            className="px-6 py-3 rounded-xl font-medium"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={busy || !title.trim()}
            className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Converting...
              </>
            ) : (
              <>
                <Target size={18} className="mr-2" />
                Convert to Task
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
