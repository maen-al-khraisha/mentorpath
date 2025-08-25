'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createTask } from '@/lib/tasksApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  ),
})

export default function TaskAddModal({ open, onClose, defaultDate }) {
  const { user, loading } = useAuth()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate || new Date())
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [labels, setLabels] = useState([])
  const [labelInput, setLabelInput] = useState('')
  const [checklist, setChecklist] = useState([])
  const [checkInput, setCheckInput] = useState('')
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
      alert('Please wait for authentication to complete')
      return
    }

    try {
      setBusy(true)
      const id = await createTask({ title, date, description, priority, labels, checklist })
      onClose?.(id)
      setTitle('')
      setDescription('')
      setLabels([])
      setChecklist([])
    } catch (e) {
      console.error(e)
      alert('Failed to save task: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  function addLabel() {
    const v = labelInput.trim()
    if (!v) return
    setLabels((ls) => Array.from(new window.Set([...ls, v])))
    setLabelInput('')
  }

  function addCheck() {
    const v = checkInput.trim()
    if (!v) return
    setChecklist((ls) => [...ls, { id: crypto.randomUUID(), text: v, done: false }])
    setCheckInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose?.()} />
      <div className="relative bg-white border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-2xl">
        <h3 className="font-semibold mb-2">Add Task</h3>
        <div className="space-y-4">
          {/* Basic Task Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs text-[var(--neutral-700)]">Task name</label>
              <input
                className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="block text-xs text-[var(--neutral-700)]">Task date</label>
              <CustomDatePicker
                value={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                name="taskDate"
                required
              />
              <label className="block text-xs text-[var(--neutral-700)]">Priority</label>
              <div className="flex items-center gap-2">
                {['High', 'Medium', 'Low'].map((p) => (
                  <label
                    key={p}
                    className={`px-2 h-9 inline-flex items-center rounded-md border border-[var(--border)] cursor-pointer ${priority === p ? 'bg-[var(--primary)] text-[var(--neutral-900)]' : ''}`}
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
            <div className="space-y-2">
              <label className="block text-xs text-[var(--neutral-700)]">Labels</label>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Label Name"
                />
                <Button variant="secondary" size="sm" onClick={addLabel}>
                  Add
                </Button>
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-1">
                {labels.map((l) => (
                  <span key={l} className="text-xs px-2 py-1 rounded bg-[var(--muted1)]">
                    {l}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 text-[var(--danger)] p-0 h-auto"
                      onClick={() => setLabels((ls) => ls.filter((x) => x !== l))}
                    >
                      ×
                    </Button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Full Width Description */}
          <div className="space-y-2">
            <label className="block text-xs text-[var(--neutral-700)]">Task Description</label>
            <div className="border border-[var(--border)] rounded-md">
              <ReactQuill
                value={description}
                onChange={setDescription}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter task description..."
                className="min-h-[200px]"
                theme="snow"
              />
            </div>
          </div>

          {/* Additional Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs text-[var(--neutral-700)]">Check list</label>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                  value={checkInput}
                  onChange={(e) => setCheckInput(e.target.value)}
                  placeholder="Add checklist item"
                />
                <Button variant="secondary" size="sm" onClick={addCheck}>
                  Add
                </Button>
              </div>
              <ul className="text-sm mt-1">
                {checklist.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={() =>
                        setChecklist((ls) =>
                          ls.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x))
                        )
                      }
                    />
                    <span className="flex-1">{c.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--danger)] p-0 h-auto"
                      onClick={() => setChecklist((ls) => ls.filter((x) => x.id !== c.id))}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-[var(--neutral-700)]">Attachments</label>
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return /* upload after create in edit mode */
                }}
              />
              <label
                htmlFor="attachment-input-v8R23CqhUnvhRvanCMFA"
                className="inline-flex items-center rounded-md font-medium 
              transition-colors whitespace-nowrap 
              border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2
                   cursor-pointer hover:bg-[var(--muted1)] hover:border-[var(--neutral-600)]"
                aria-disabled="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-paperclip"
                >
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
                Attach file
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onClose?.()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={!user || loading || busy}>
            {loading ? 'Loading...' : busy ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </div>
    </div>
  )
}
