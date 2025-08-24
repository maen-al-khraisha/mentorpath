'use client'

import { useState, useEffect, useRef } from 'react'
import { updateTask, addAttachment, deleteTask, removeAttachment } from '@/lib/tasksApi'
import Button from '@/components/Button'
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
  MoreVertical,
  Calendar,
  Clock as ClockIcon,
  Copy as CopyIcon,
  Trash2,
  Edit,
} from 'lucide-react'
import { format } from 'date-fns'

export default function TaskDetailsPanel({
  task,
  onUpdate,
  onStartTimer,
  onStopTimer,
  activeTimer,
  onShowShiftModal,
  onShowChangeDate,
  onShowAddTime,
  onShowCopyModal,
  onPreviewAttachment,
  onEditDescription,
}) {
  const [description, setDescription] = useState(task?.description || '')
  const [editingLabels, setEditingLabels] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [pendingAttachmentName, setPendingAttachmentName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [localAttachments, setLocalAttachments] = useState([])
  const reachedAttachmentLimit = (localAttachments?.length || 0) >= 3
  const [showActions, setShowActions] = useState(false)
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
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg text-gray-900 leading-tight flex-1">
              {task.title}
            </h3>
            <div className="relative flex-shrink-0" ref={actionsRef}>
              <Button
                variant="ghost"
                size="icon"
                className="p-1.5"
                aria-label="More options"
                onClick={() => setShowActions((v) => !v)}
              >
                <MoreVertical size={16} />
              </Button>
              {showActions && (
                <div className="absolute right-0 top-8 z-10 w-52 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  <Button
                    variant="ghost"
                    className="w-full px-3 py-2 flex gap-1 justify-start text-sm"
                    onClick={() => {
                      setShowActions(false)
                      onShowChangeDate?.()
                    }}
                  >
                    <Calendar size={14} /> <span>Change date</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full px-3 py-2 flex gap-1 justify-start text-sm"
                    onClick={() => {
                      setShowActions(false)
                      const now = new Date()
                      const pad = (n) => String(n).padStart(2, '0')
                      const toDate = (d) =>
                        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
                      const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
                      onShowAddTime?.()
                    }}
                  >
                    <ClockIcon size={14} /> <span>Add time</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full px-3 py-2 flex gap-1 justify-start text-sm"
                    onClick={() => {
                      setShowActions(false)
                      onShowCopyModal?.()
                    }}
                  >
                    <CopyIcon size={14} /> <span>Copy task</span>
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full px-3 py-2 flex gap-1 justify-start text-sm"
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

          {/* Status & Meta Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  (task.priority || 'Medium') === 'High'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : (task.priority || 'Medium') === 'Low'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    (task.priority || 'Medium') === 'High'
                      ? 'bg-red-500'
                      : (task.priority || 'Medium') === 'Low'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                  }`}
                ></span>
                {task.priority || 'Medium'} Priority
              </span>
              {isShifted && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Shifted
                </span>
              )}
            </div>

            {/* Completion Button */}
            <Button
              variant={task.completed ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => updateTask(task.id, { completed: !task.completed })}
            >
              <div className="w-4 h-4 rounded border border-current flex items-center justify-center">
                {task.completed && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </div>
              <span className="ml-2">{task.completed ? 'Completed' : 'Mark Done'}</span>
            </Button>
          </div>

          {/* Shifted Date Info (if applicable) */}
          {isShifted && (
            <div className="px-3 py-2 bg-orange-50 rounded-md border border-orange-100">
              <p className="text-sm text-orange-700">
                Originally scheduled for{' '}
                <span className="font-medium">
                  {format(normalizeDateLocal(task?.originalDate) || new Date(), 'MMM dd, yyyy')}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--neutral-700)]">
            <Clock size={16} />
            <span>Timer</span>
          </div>
          <div className="flex items-center gap-2">
            {isTimerActive ? (
              <Button variant="danger" size="sm" onClick={() => onStopTimer?.(task.id)}>
                <Pause size={14} />
                <span className="ml-2">Stop Timer</span>
              </Button>
            ) : task.completed ? (
              <Button
                variant="primary"
                size="sm"
                disabled
                title="Task is completed"
                className="opacity-60 cursor-not-allowed"
              >
                <Play size={14} />
                <span className="ml-2">Start Timer</span>
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => onStartTimer?.(task.id)}>
                <Play size={14} />
                <span className="ml-2">Start Timer</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => onShowShiftModal?.()}>
              <ArrowRight size={14} />
              <span className="ml-2">Shift to Tomorrow</span>
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          <div className="flex items-center justify-between mb-2 border-b-2 border-gray-200 pb-2">
            <label className="text-sm font-semibold text-[var(--neutral-700)] flex items-center gap-1">
              <FileText size={16} />
              Description
            </label>
            <Button
              variant="ghost"
              className="inline-flex items-center rounded-md font-medium 
              transition-colors whitespace-nowrap 
              border border-gray-300 text-gray-700 hover:bg-gray-100 p-1 text-xs"
              onClick={() => onEditDescription?.(task.id)}
            >
              <Edit size={14} />
            </Button>
          </div>
          <div className=" min-h-[60px]">
            {task.description ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            ) : (
              <span className="text-[var(--neutral-700)] italic">No description added</span>
            )}
          </div>
        </div>

        {/* Properties */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-1">
            Priority
          </label>
          <div className="flex items-center gap-2">
            {['High', 'Medium', 'Low'].map((p) => (
              <label
                key={p}
                className={`px-2 h-9 inline-flex items-center rounded-md border border-[var(--border)] cursor-pointer ${(task.priority || 'Medium') === p ? 'bg-[var(--primary)] text-[var(--neutral-900)]' : ''}`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  className="sr-only"
                  onChange={() => updateTask(task.id, { priority: p })}
                  checked={(task.priority || 'Medium') === p}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          <div className="flex items-center gap-1 mb-2">
            <Tag size={16} className="text-[var(--neutral-700)]" />
            <label className="text-sm font-semibold text-[var(--neutral-700)]">Labels</label>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {task.labels?.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-xs px-2 h-9 bg-blue-100 text-blue-800 rounded-md"
              >
                {label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-blue-900 p-0 h-auto"
                  onClick={() => handleRemoveLabel(label)}
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
              placeholder="Add label"
              className="w-max h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
            />
            <Button
              variant="primary"
              className="px-3 h-9"
              onClick={handleAddLabel}
              aria-label="Add label"
              title="Add label"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <List size={16} className="text-[var(--neutral-700)]" />
              <label className="text-sm font-semibold text-[var(--neutral-700)]">
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
                <button
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  aria-label="Delete checklist item"
                  className="text-red-300 hover:text-red-600 transition-colors 
                    hover:border-red-500"
                >
                  <Trash2 size={16} />
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
                className="w-max h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
              />
              <Button
                variant="primary"
                className="h-9 px-3"
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
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-3 shadow-sm">
          <div className="flex items-center gap-1 mb-2">
            <Paperclip size={16} className="text-[var(--neutral-700)]" />
            <label className="text-sm font-semibold text-[var(--neutral-700)]">Attachments</label>
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
                className={`inline-flex items-center rounded-md font-medium 
              transition-colors whitespace-nowrap 
              border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1
                   ${
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
                  <>{reachedAttachmentLimit ? 'Max 3 attachments' : 'Attach file'}</>
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
                        if (attachment.url) onPreviewAttachment?.(attachment.url, attachment.name)
                      }}
                      className="text-slate-400 hover:text-blue-500 transition-colors  hover:border-blue-300"
                      title="View"
                      aria-label={`View ${attachment.name}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await removeAttachment(task.id, attachment)
                          setLocalAttachments((prev) => prev.filter((_, i) => i !== index))
                        } catch (error) {
                          console.error('Failed to remove attachment:', error)
                          // You could add a toast notification here
                        }
                      }}
                      className="text-red-300 hover:text-red-600 transition-colors 
                       hover:border-red-300"
                      title="Remove"
                      aria-label={`Remove ${attachment.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-[var(--neutral-700)] italic">No attachments</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Shift to Tomorrow Modal */}
      {/* Removed as per edit hint */}

      {/* Change Date Modal */}
      {/* Removed as per edit hint */}

      {/* Add Time Modal */}
      {/* Removed as per edit hint */}

      {/* Copy Task Modal */}
      {/* Removed as per edit hint */}

      {/* Attachment Preview Modal */}
      {/* Removed as per edit hint */}
    </>
  )
}
