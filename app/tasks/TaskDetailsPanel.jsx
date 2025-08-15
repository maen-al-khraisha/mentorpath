'use client'

import { useState, useEffect, useRef } from 'react'
import {
  updateTask,
  startWorkSession,
  stopWorkSession,
  shiftTaskToTomorrow,
  addAttachment,
  shiftTaskToDate,
  addManualWorkSession,
  createTask,
  deleteTask,
} from '@/lib/tasksApi'
import Checkbox from '@/components/ui/AnimatedCheckbox'
import Button from '@/components/Button'
import {
  Play,
  Pause,
  Clock,
  Tag,
  List,
  FileText,
  Paperclip,
  Eye,
  Loader2,
  ArrowRight,
  X,
  Plus,
  MoreVertical,
  Calendar,
  Clock as ClockIcon,
  Copy as CopyIcon,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'

export default function TaskDetailsPanel({
  task,
  onUpdate,
  onStartTimer,
  onStopTimer,
  activeTimer,
}) {
  const [editingDescription, setEditingDescription] = useState(false)
  const [description, setDescription] = useState(task?.description || '')
  const [editingLabels, setEditingLabels] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [shiftReason, setShiftReason] = useState('')
  const [pendingAttachmentName, setPendingAttachmentName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [localAttachments, setLocalAttachments] = useState([])
  const reachedAttachmentLimit = (localAttachments?.length || 0) >= 3
  const [previewItem, setPreviewItem] = useState(null) // { url, name }
  const [showActions, setShowActions] = useState(false)
  const [showChangeDate, setShowChangeDate] = useState(false)
  const [targetDate, setTargetDate] = useState('')
  const [targetReason, setTargetReason] = useState('')
  const [isSubmittingChangeDate, setIsSubmittingChangeDate] = useState(false)
  const [showAddTime, setShowAddTime] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationHours, setDurationHours] = useState('0')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [isSubmittingTime, setIsSubmittingTime] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [copyTitle, setCopyTitle] = useState('')
  const [copyDate, setCopyDate] = useState('')
  const [copyDescription, setCopyDescription] = useState('')
  const [copyPriority, setCopyPriority] = useState('Medium')
  const [copyLabels, setCopyLabels] = useState(true)
  const [copyChecklist, setCopyChecklist] = useState(true)
  const [isSubmittingCopy, setIsSubmittingCopy] = useState(false)
  const actionsRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (showActions && actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  function normalizeDateLocal(input) {
    if (!input) return null
    if (input instanceof Date) return input
    if (typeof input === 'object' && typeof input.toDate === 'function') {
      try {
        return input.toDate()
      } catch {
        return null
      }
    }
    const d = new Date(input)
    return isNaN(d.getTime()) ? null : d
  }

  function formatDateTimeLocal(d) {
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }

  const isShifted = (() => {
    const od = normalizeDateLocal(task?.originalDate)
    const cd = normalizeDateLocal(task?.date)
    if (!od || !cd) return false
    return od.getTime() < cd.getTime()
  })()

  useEffect(() => {
    setLocalAttachments(task?.attachments || [])
  }, [task])

  if (!task) {
    return <div className="text-sm text-[var(--neutral-700)]">Select a task to see details.</div>
  }

  const handleSaveDescription = () => {
    if (description !== task.description) {
      updateTask(task.id, { description })
    }
    setEditingDescription(false)
  }

  const handleAddLabel = () => {
    if (newLabel.trim() && !task.labels?.includes(newLabel.trim())) {
      const updatedLabels = [...(task.labels || []), newLabel.trim()]
      updateTask(task.id, { labels: updatedLabels })
      setNewLabel('')
    }
  }

  const handleRemoveLabel = (labelToRemove) => {
    const updatedLabels = task.labels?.filter((label) => label !== labelToRemove) || []
    updateTask(task.id, { labels: updatedLabels })
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const updatedChecklist = [
        ...(task.checklist || []),
        { id: crypto.randomUUID(), text: newChecklistItem.trim(), done: false },
      ]
      updateTask(task.id, { checklist: updatedChecklist })
      setNewChecklistItem('')
    }
  }

  const handleToggleChecklistItem = (itemId) => {
    const updatedChecklist =
      task.checklist?.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) ||
      []
    updateTask(task.id, { checklist: updatedChecklist })
  }

  const handleRemoveChecklistItem = (itemId) => {
    const updatedChecklist = task.checklist?.filter((item) => item.id !== itemId) || []
    updateTask(task.id, { checklist: updatedChecklist })
  }

  const handleShiftToTomorrow = () => {
    shiftTaskToTomorrow(task.id, task.date, shiftReason)
    setShowShiftModal(false)
    setShiftReason('')
  }

  const isTimerActive = activeTimer?.taskId === task.id
  const completedChecklistItems = task.checklist?.filter((item) => item.done).length || 0
  const totalChecklistItems = task.checklist?.length || 0
  const attachmentInputId = `attachment-input-${task.id}`

  const priorityBadgeClass =
    (task.priority || 'Medium') === 'High'
      ? 'bg-red-100 text-red-800'
      : (task.priority || 'Medium') === 'Low'
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <span
              className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${priorityBadgeClass}`}
            >
              {task.priority || 'Medium'}
            </span>
            {isShifted && (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                Shifted
              </span>
            )}
          </div>
          {isShifted && (
            <div className="mt-1 text-xs text-[var(--neutral-700)]">
              Original date:{' '}
              {format(normalizeDateLocal(task?.originalDate) || new Date(), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 relative" ref={actionsRef}>
          <label className="border border-green-500 text-green-600 bg-transparent rounded-md px-3 py-1.5 font-medium hover:bg-green-50 hover:border-green-600 hover:text-green-700 active:bg-green-100 transition-colors duration-150 focus:outline-none inline-flex items-center text-sm cursor-pointer select-none">
            <Checkbox
              checked={!!task.completed}
              onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
              aria-label="Mark as complete"
            />
            <span className={task.completed ? 'line-through text-[var(--neutral-700)]' : ''}>
              Done
            </span>
          </label>
          <Button
            variant="ghost"
            className="p-1"
            aria-label="More actions"
            onClick={() => setShowActions((v) => !v)}
          >
            <MoreVertical size={18} />
          </Button>
          {showActions && (
            <div className="absolute right-0 top-7 z-10 w-52 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-soft py-1">
              <Button
                variant="ghost"
                className="w-full px-3 py-2 justify-start text-sm"
                onClick={() => {
                  setShowActions(false)
                  setTargetDate('')
                  setTargetReason('')
                  setShowChangeDate(true)
                }}
              >
                <Calendar size={14} /> <span>Change date</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full px-3 py-2 justify-start text-sm"
                onClick={() => {
                  setShowActions(false)
                  const now = new Date()
                  const pad = (n) => String(n).padStart(2, '0')
                  const toDate = (d) =>
                    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
                  const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
                  setStartDate(toDate(now))
                  setStartTime(toTime(now))
                  setDurationHours('0')
                  setDurationMinutes('30')
                  setShowAddTime(true)
                }}
              >
                <ClockIcon size={14} /> <span>Add time</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full px-3 py-2 justify-start text-sm"
                onClick={() => {
                  setShowActions(false)
                  setCopyTitle(task.title || '')
                  setCopyDate('')
                  setCopyDescription(task.description || '')
                  setCopyPriority(task.priority || 'Medium')
                  setCopyLabels(true)
                  setCopyChecklist(true)
                  setShowCopyModal(true)
                }}
              >
                <CopyIcon size={14} /> <span>Copy task</span>
              </Button>
              <Button
                variant="danger"
                className="w-full px-3 py-2 justify-start text-sm"
                onClick={async () => {
                  setShowActions(false)
                  if (!confirm('Delete this task? This cannot be undone.')) return
                  try {
                    await deleteTask(task.id)
                  } catch (e) {
                    console.error('Delete failed', e)
                  }
                }}
              >
                <Trash2 size={14} /> <span>Delete task</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Properties */}
      <div>
        <label className="block text-xs text-[var(--neutral-700)] mb-1">Priority</label>
        <select
          value={task.priority || 'Medium'}
          onChange={(e) => updateTask(task.id, { priority: e.target.value })}
          className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Timer Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--neutral-700)]">
          <Clock size={14} />
          <span>Timer</span>
        </div>
        <div className="flex items-center gap-2">
          {isTimerActive ? (
            <button
              onClick={() => onStopTimer?.(task.id)}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              <Pause size={14} />
              Stop Timer
            </button>
          ) : task.completed ? (
            <Button
              variant="primary"
              disabled
              title="Task is completed"
              className="opacity-60 cursor-not-allowed"
            >
              <Play size={14} />
              <span>Start Timer</span>
            </Button>
          ) : (
            <Button variant="primary" onClick={() => onStartTimer?.(task.id)}>
              <Play size={14} />
              <span>Start Timer</span>
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowShiftModal(true)}>
            <ArrowRight size={14} />
            <span>Shift to Tomorrow</span>
          </Button>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--neutral-700)] flex items-center gap-1">
            <FileText size={14} />
            Description
          </label>
          <Button
            variant="ghost"
            className="p-1 text-xs"
            onClick={() => setEditingDescription(!editingDescription)}
          >
            {editingDescription ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        {editingDescription ? (
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-2 text-sm"
              rows={4}
              placeholder="Add task description..."
            />
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="primary"
                className="px-3 py-1 text-sm"
                onClick={handleSaveDescription}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-1 text-sm"
                onClick={() => {
                  setDescription(task.description || '')
                  setEditingDescription(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm bg-[var(--muted1)] p-2 rounded min-h-[60px]">
            {task.description || (
              <span className="text-[var(--neutral-700)] italic">No description added</span>
            )}
          </div>
        )}
      </div>

      {/* Labels */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Tag size={14} className="text-[var(--neutral-700)]" />
          <label className="text-xs text-[var(--neutral-700)]">Labels</label>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {task.labels?.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
            >
              {label}
              <button onClick={() => handleRemoveLabel(label)} className="hover:text-blue-900">
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
            placeholder="Add label"
            className="h-7 px-2 rounded border border-dashed border-[var(--border)] bg-[var(--bg-card)] text-xs"
          />
          <Button
            variant="primary"
            className="p-1"
            onClick={handleAddLabel}
            aria-label="Add label"
            title="Add label"
            style={{ height: '24px' }}
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>

      {/* Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <List size={14} className="text-[var(--neutral-700)]" />
            <label className="text-xs text-[var(--neutral-700)]">
              Checklist ({completedChecklistItems}/{totalChecklistItems})
            </label>
          </div>
          {totalChecklistItems > 0 && (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-xs text-[var(--neutral-700)]">
                {Math.round((completedChecklistItems / totalChecklistItems) * 100)}%
              </span>
              <div className="w-1/2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {task.checklist?.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={item.done}
                  onChange={() => handleToggleChecklistItem(item.id)}
                  aria-label="Checklist item"
                />
                <span
                  className={`text-sm ${item.done ? 'line-through text-[var(--neutral-700)]' : ''}`}
                >
                  {item.text}
                </span>
              </label>
              <Button
                variant="danger"
                className="p-1"
                onClick={() => handleRemoveChecklistItem(item.id)}
                aria-label="Delete checklist item"
              >
                <X size={14} />
              </Button>
            </div>
          )) || (
            <span className="text-xs text-[var(--neutral-700)] italic">No checklist items</span>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              placeholder="Add checklist item"
              className="flex-1 h-7 px-2 rounded border border-dashed border-[var(--border)] bg-[var(--bg-card)] text-xs"
            />
            <Button
              variant="primary"
              style={{ height: '24px' }}
              onClick={handleAddChecklistItem}
              aria-label="Add checklist item"
              title="Add checklist item"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Paperclip size={14} className="text-[var(--neutral-700)]" />
          <label className="text-xs text-[var(--neutral-700)]">Attachments</label>
        </div>
        <div className="space-y-2">
          <div className="pt-1">
            <input
              id={attachmentInputId}
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (reachedAttachmentLimit) {
                  setUploadError('Attachment limit reached (max 3 per task)')
                  if (e.target) e.target.value = ''
                  return
                }
                setUploadError('')
                setPendingAttachmentName(file.name)
                setIsUploading(true)
                try {
                  const url = await addAttachment(task.id, file)
                  setPendingAttachmentName('')
                  setLocalAttachments((prev) => [...(prev || []), { name: file.name, url }])
                } catch (err) {
                  console.error('Attachment upload failed:', err)
                  const message = err?.message || 'Failed to upload. Please try again.'
                  setUploadError(message)
                } finally {
                  setIsUploading(false)
                  if (e.target) e.target.value = ''
                }
              }}
            />
            <label
              htmlFor={isUploading || reachedAttachmentLimit ? undefined : attachmentInputId}
              className={`inline-flex items-center gap-2 px-3 py-2 border border-dashed border-[var(--border)] rounded-md text-sm transition-colors ${
                isUploading || reachedAttachmentLimit
                  ? 'opacity-70 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-[var(--muted1)] hover:border-[var(--neutral-600)]'
              }`}
              aria-disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Paperclip size={14} />
                  {reachedAttachmentLimit ? 'Max 3 attachments' : 'Attach file'}
                </>
              )}
            </label>
            {pendingAttachmentName && (
              <span className="ml-2 text-xs text-[var(--neutral-700)]">
                Selected: {pendingAttachmentName}
              </span>
            )}
            {uploadError && <div className="mt-1 text-xs text-red-600">{uploadError}</div>}
          </div>
          <div className="space-y-2">
            {localAttachments?.length > 0 ? (
              localAttachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border border-[var(--border)] rounded"
                >
                  <Paperclip size={14} className="text-[var(--neutral-700)]" />
                  <span className="text-sm flex-1 truncate">{attachment.name}</span>
                  <button
                    onClick={() => {
                      if (attachment.url)
                        setPreviewItem({ url: attachment.url, name: attachment.name })
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-[var(--muted1)] text-blue-600"
                    title="View"
                    aria-label={`View ${attachment.name}`}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-xs text-[var(--neutral-700)] italic">No attachments</span>
            )}
          </div>
        </div>
      </div>

      {/* Shift to Tomorrow Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShiftModal(false)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
            <h3 className="font-semibold mb-3">Shift Task to Tomorrow</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                  placeholder="Why are you shifting this task?"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowShiftModal(false)}
                  className="px-3 py-2 border border-[var(--border)] rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShiftToTomorrow}
                  className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  Shift Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Date Modal */}
      {showChangeDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowChangeDate(false)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
            <h3 className="font-semibold mb-3">Change Date</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">New date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  value={targetReason}
                  onChange={(e) => setTargetReason(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-2 border border-[var(--border)] rounded text-sm"
                  onClick={() => setShowChangeDate(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={!targetDate || isSubmittingChangeDate}
                  onClick={async () => {
                    if (!targetDate) return
                    setIsSubmittingChangeDate(true)
                    try {
                      // Construct Date from yyyy-mm-dd
                      const parts = targetDate.split('-')
                      const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                      await shiftTaskToDate(task.id, dt, targetReason)
                      setShowChangeDate(false)
                      setTargetDate('')
                      setTargetReason('')
                    } catch (e) {
                      console.error('Change date failed', e)
                    } finally {
                      setIsSubmittingChangeDate(false)
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
                >
                  {isSubmittingChangeDate ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Time Modal */}
      {showAddTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddTime(false)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
            <h3 className="font-semibold mb-3">Add Manual Time</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-[var(--neutral-700)] mb-1">Start</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                    />
                    <span className="text-xs text-[var(--neutral-700)] w-10 text-center">
                      {Number((startTime || '0:0').split(':')[0]) >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--neutral-700)] mb-1">Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      className="h-9 w-20 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                    />
                    <span className="text-xs">hours</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="h-9 w-20 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                    />
                    <span className="text-xs">minutes</span>
                  </div>
                  {startDate && startTime && (
                    <div className="mt-2 text-xs text-[var(--neutral-700)]">
                      {(() => {
                        const [sy, sm, sd] = startDate.split('-').map(Number)
                        const [sh, smin] = startTime.split(':').map(Number)
                        const start = new Date(sy, (sm || 1) - 1, sd || 1, sh || 0, smin || 0)
                        const mins = Math.max(
                          0,
                          parseInt(durationHours || '0', 10) * 60 +
                            parseInt(durationMinutes || '0', 10)
                        )
                        const end = new Date(start.getTime() + mins * 60000)
                        const durText = `${Math.floor(mins / 60)}h ${mins % 60}m`
                        const endText = end.toLocaleString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                          month: 'short',
                          day: '2-digit',
                        })
                        return `Duration: ${durText} — Ends at: ${endText}`
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-2 border border-[var(--border)] rounded text-sm"
                  onClick={() => setShowAddTime(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={
                    !startDate ||
                    !startTime ||
                    (parseInt(durationHours || '0', 10) === 0 &&
                      parseInt(durationMinutes || '0', 10) === 0) ||
                    isSubmittingTime
                  }
                  onClick={async () => {
                    if (!startDate || !startTime) return
                    setIsSubmittingTime(true)
                    try {
                      const [sy, sm, sd] = startDate.split('-').map(Number)
                      const [sh, smin] = startTime.split(':').map(Number)
                      const start = new Date(sy, (sm || 1) - 1, sd || 1, sh || 0, smin || 0)
                      const mins = Math.max(
                        0,
                        parseInt(durationHours || '0', 10) * 60 +
                          parseInt(durationMinutes || '0', 10)
                      )
                      const end = new Date(start.getTime() + mins * 60000)
                      await addManualWorkSession(task.id, start, end)
                      setShowAddTime(false)
                      setStartDate('')
                      setStartTime('')
                      setDurationHours('0')
                      setDurationMinutes('30')
                    } catch (e) {
                      console.error('Add time failed', e)
                    } finally {
                      setIsSubmittingTime(false)
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
                >
                  {isSubmittingTime ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Task Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCopyModal(false)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
            <h3 className="font-semibold mb-3">Copy Task</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">Title</label>
                <input
                  type="text"
                  value={copyTitle}
                  onChange={(e) => setCopyTitle(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">Date</label>
                <input
                  type="date"
                  value={copyDate}
                  onChange={(e) => setCopyDate(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">Priority</label>
                <select
                  value={copyPriority}
                  onChange={(e) => setCopyPriority(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--neutral-700)] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={copyDescription}
                  onChange={(e) => setCopyDescription(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={copyLabels}
                    onChange={(e) => setCopyLabels(e.target.checked)}
                  />
                  Copy labels
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={copyChecklist}
                    onChange={(e) => setCopyChecklist(e.target.checked)}
                  />
                  Copy checklist
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-2 border border-[var(--border)] rounded text-sm"
                  onClick={() => setShowCopyModal(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={!copyTitle || isSubmittingCopy}
                  onClick={async () => {
                    setIsSubmittingCopy(true)
                    try {
                      const d = copyDate
                        ? new Date(
                            Number(copyDate.split('-')[0]),
                            Number(copyDate.split('-')[1]) - 1,
                            Number(copyDate.split('-')[2])
                          )
                        : new Date()
                      await createTask({
                        title: copyTitle,
                        description: copyDescription,
                        date: d,
                        priority: copyPriority,
                        labels: copyLabels ? task.labels || [] : [],
                        checklist: copyChecklist ? task.checklist || [] : [],
                      })
                      setShowCopyModal(false)
                    } catch (e) {
                      console.error('Copy task failed', e)
                    } finally {
                      setIsSubmittingCopy(false)
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
                >
                  {isSubmittingCopy ? 'Creating...' : 'Create task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewItem(null)} />
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-soft w-[90vw] max-w-3xl max-h-[90vh] overflow-hidden">
            <button
              className="absolute top-2 right-2 p-1 rounded-md border border-[var(--border)] hover:bg-[var(--muted1)]"
              aria-label="Close"
              onClick={() => setPreviewItem(null)}
            >
              <X size={16} />
            </button>
            <div className="p-2 flex items-center justify-center w-full h-full">
              {(() => {
                const name = previewItem?.name || ''
                const url = previewItem?.url || ''
                const ext = name.split('.').pop()?.toLowerCase() || ''
                const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
                if (imageExts.includes(ext)) {
                  return (
                    <img
                      src={url}
                      alt="Attachment preview"
                      className="max-h-[85vh] w-auto object-contain"
                    />
                  )
                }
                if (ext === 'pdf' || ext === 'txt') {
                  return (
                    <iframe
                      src={url}
                      title="Attachment preview"
                      className="w-[88vw] max-w-3xl h-[85vh]"
                    />
                  )
                }
                return (
                  <div className="p-6 text-center">
                    <div className="mb-3 text-sm text-[var(--neutral-700)]">
                      Preview not available for this file type.
                    </div>
                    <button
                      className="px-3 py-2 rounded-md border border-[var(--border)] text-sm"
                      onClick={() => window.open(url, '_blank', 'noopener')}
                    >
                      Open in new tab
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
