'use client'

import { useState } from 'react'
import { createTask } from '@/lib/tasksApi'
import { useAuth } from '@/lib/useAuth'

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

  if (!open) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={() => onClose?.()} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-2xl">
        <h3 className="font-semibold mb-2">Add Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--neutral-700)]">Task name</label>
            <input
              className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="block text-xs text-[var(--neutral-700)]">Task date</label>
            <input
              type="date"
              className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
              value={new Date(date).toISOString().slice(0, 10)}
              onChange={(e) => setDate(new Date(e.target.value))}
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
            <label className="block text-xs text-[var(--neutral-700)]">Labels</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Label Name"
              />
              <button
                className="h-9 px-3 rounded-md border border-[var(--border)]"
                onClick={addLabel}
              >
                Add
              </button>
            </div>
            <div className="flex items-center gap-1 flex-wrap mt-1">
              {labels.map((l) => (
                <span key={l} className="text-xs px-2 py-1 rounded bg-[var(--muted1)]">
                  {l}
                  <button
                    className="ml-1 text-[var(--danger)]"
                    onClick={() => setLabels((ls) => ls.filter((x) => x !== l))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--neutral-700)]">Task Description</label>
            <textarea
              rows={8}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label className="block text-xs text-[var(--neutral-700)]">Check list</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                placeholder="Add checklist item"
              />
              <button
                className="h-9 px-3 rounded-md border border-[var(--border)]"
                onClick={addCheck}
              >
                Add
              </button>
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
                  <button
                    className="text-[var(--danger)]"
                    onClick={() => setChecklist((ls) => ls.filter((x) => x.id !== c.id))}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <label className="block text-xs text-[var(--neutral-700)]">Attachments</label>
            <input
              type="file"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return /* upload after create in edit mode */
              }}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-3 h-9 rounded-md border border-[var(--border)]"
            onClick={() => onClose?.()}
          >
            Cancel
          </button>
          <button
            className={`px-3 h-9 rounded-md text-[var(--neutral-900)] ${
              !user || loading || busy
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[var(--primary)] hover:opacity-90'
            }`}
            onClick={onSave}
            disabled={!user || loading || busy}
          >
            {loading ? 'Loading...' : busy ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
