'use client'

import { useState, useEffect } from 'react'
import {
  updateTask,
  startWorkSession,
  stopWorkSession,
  shiftTaskToTomorrow,
  addAttachment,
} from '@/lib/tasksApi'
import Checkbox from '@/components/ui/AnimatedCheckbox'
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
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox
            checked={!!task.completed}
            onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
            aria-label="Mark as complete"
          />
          <span className={task.completed ? 'line-through text-[var(--neutral-700)]' : ''}>
            Done
          </span>
        </label>
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
          ) : (
            <button
              onClick={() => onStartTimer?.(task.id)}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
            >
              <Play size={14} />
              Start Timer
            </button>
          )}
          <button
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-md text-sm hover:bg-[var(--muted1)]"
          >
            <ArrowRight size={14} />
            Shift to Tomorrow
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--neutral-700)] flex items-center gap-1">
            <FileText size={14} />
            Description
          </label>
          <button
            onClick={() => setEditingDescription(!editingDescription)}
            className="text-xs text-blue-600 hover:underline"
          >
            {editingDescription ? 'Cancel' : 'Edit'}
          </button>
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
              <button
                onClick={handleSaveDescription}
                className="px-3 py-1 bg-[var(--primary)] text-[var(--neutral-900)] rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setDescription(task.description || '')
                  setEditingDescription(false)
                }}
                className="px-3 py-1 border border-[var(--border)] rounded text-sm"
              >
                Cancel
              </button>
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
          <button
            onClick={handleAddLabel}
            className="inline-flex items-center justify-center w-7 h-7 rounded bg-[var(--primary)] text-[var(--neutral-900)]"
            aria-label="Add label"
            title="Add label"
          >
            <Plus size={14} />
          </button>
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
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0}%`,
                }}
              />
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
              <button
                onClick={() => handleRemoveChecklistItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
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
              className="flex-1 h-8 rounded border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
            />
            <button
              onClick={handleAddChecklistItem}
              className="px-2 py-1 bg-[var(--primary)] text-[var(--neutral-900)] rounded text-sm"
            >
              Add
            </button>
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
