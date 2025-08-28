'use client'

import { useState, useEffect, useRef } from 'react'
import { updateTask, addAttachment, removeAttachment } from '@/lib/tasksApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import Checkbox from '@/components/ui/AnimatedCheckbox'
import LabelBadge from '@/components/LabelBadge'

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
  onDelete,
}) {
  const { user } = useAuth()
  const { showToast } = useToast()

  // Safety check: don't render if no task
  if (!task) {
    return null
  }

  const [description, setDescription] = useState(task?.description || '')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingTitleValue, setEditingTitleValue] = useState(task?.title || '')
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

  // Handle title editing
  const handleTitleSave = async () => {
    console.log('handleTitleSave called with task:', task)
    console.log('task.id:', task?.id)

    if (!task?.id) {
      console.error('Task ID is undefined or null:', task)
      showToast('Cannot update task: Invalid task ID', 'error')
      setEditingTitle(false)
      return
    }

    if (editingTitleValue.trim() && editingTitleValue !== task.title) {
      try {
        await updateTask(task.id, { title: editingTitleValue.trim() })
        showToast('Task title updated successfully!', 'success')
        onUpdate?.()
      } catch (error) {
        console.error('Failed to update task title:', error)
        showToast('Failed to update task title', 'error')
        setEditingTitleValue(task.title) // Reset to original value
      }
    }
    setEditingTitle(false)
  }

  // Handle title edit cancel
  const handleTitleCancel = () => {
    setEditingTitleValue(task.title)
    setEditingTitle(false)
  }

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
  }, [task?.attachments])

  // Update editing title value when task changes
  useEffect(() => {
    setEditingTitleValue(task?.title || '')
  }, [task?.title])

  // Debug task changes
  useEffect(() => {
    console.log('TaskDetailsPanel: task prop changed:', task)
    console.log('TaskDetailsPanel: task.id:', task?.id)
    console.log('TaskDetailsPanel: task type:', typeof task)
    console.log('TaskDetailsPanel: task keys:', task ? Object.keys(task) : 'no task')
  }, [task])

  if (!task) {
    return <div className="text-sm text-[var(--neutral-700)]">Select a task to see details.</div>
  }

  if (!task.id) {
    console.error('Task object is missing ID:', task)
    return (
      <div className="text-sm text-[var(--neutral-700)]">
        Invalid task data. Please select a valid task.
      </div>
    )
  }

  const handleAddLabel = () => {
    if (!task?.id) {
      console.error('Task ID is undefined in handleAddLabel:', task)
      showToast('Cannot update task: Invalid task ID', 'error')
      return
    }

    if (newLabel.trim() && !task.labels?.includes(newLabel.trim())) {
      const updatedLabels = [...(task.labels || []), newLabel.trim()]
      updateTask(task.id, { labels: updatedLabels })
      setNewLabel('')
      showToast(`Label "${newLabel.trim()}" added successfully!`, 'success')
    }
  }

  const handleRemoveLabel = (labelToRemove) => {
    if (!task?.id) {
      console.error('Task ID is undefined in handleRemoveLabel:', task)
      showToast('Cannot update task: Invalid task ID', 'error')
      return
    }

    const updatedLabels = task.labels?.filter((label) => label !== labelToRemove) || []
    updateTask(task.id, { labels: updatedLabels })
    showToast(`Label "${labelToRemove}" removed successfully!`, 'success')
  }

  const handleAddChecklistItem = () => {
    if (!task?.id) {
      console.error('Task ID is undefined in handleAddChecklistItem:', task)
      showToast('Cannot update task: Invalid task ID', 'error')
      return
    }

    if (newChecklistItem.trim()) {
      const updatedChecklist = [
        ...(task.checklist || []),
        { id: crypto.randomUUID(), text: newChecklistItem.trim(), done: false },
      ]
      updateTask(task.id, { checklist: updatedChecklist })
      setNewChecklistItem('')
      showToast(`Checklist item "${newChecklistItem.trim()}" added successfully!`, 'success')
    }
  }

  const handleToggleChecklistItem = (itemId) => {
    if (!task?.id) {
      console.error('Task ID is undefined in handleToggleChecklistItem:', task)
      showToast('Cannot update task: Invalid task ID', 'error')
      return
    }

    const updatedChecklist =
      task.checklist?.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) ||
      []
    updateTask(task.id, { checklist: updatedChecklist })

    const item = task.checklist?.find((item) => item.id === itemId)
    if (item) {
      showToast(item.done ? 'Item unchecked!' : 'Item checked! ✅', 'success')
    }
  }

  const handleRemoveChecklistItem = (itemId) => {
    if (!task?.id) {
      console.error('Task ID is undefined in handleRemoveChecklistItem:', task)
      showToast('Cannot update task: Invalid task ID', 'error')
      return
    }

    const updatedChecklist = task.checklist?.filter((item) => item.id !== itemId) || []
    updateTask(task.id, { checklist: updatedChecklist })
    showToast('Checklist item removed successfully!', 'success')
  }

  const isTimerActive = activeTimer?.taskId === task.id
  const completedChecklistItems = task.checklist?.filter((item) => item.done).length || 0
  const totalChecklistItems = task.checklist?.length || 0
  const attachmentInputId = `attachment-input-${task.id}`

  return (
    <>
      <div className="bg-white space-y-4 overflow-hidden">
        {/* Hero Section - Task Title & Primary Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          {/* Title & Actions Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editingTitleValue}
                    onChange={(e) => setEditingTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave()
                      if (e.key === 'Escape') handleTitleCancel()
                    }}
                    className="text-2xl font-bold text-slate-900 leading-tight bg-white border-2 border-blue-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleTitleSave}
                    className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                    title="Save title"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                    title="Cancel edit"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h1
                    className="text-2xl font-bold text-slate-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setEditingTitle(true)}
                    title="Click to edit title"
                  >
                    {task.title}
                  </h1>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    title="Edit title"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              )}

              {/* Priority & Status Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    (task.priority || 'Medium') === 'High'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : (task.priority || 'Medium') === 'Low'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span className="mr-2 text-base">
                    {(task.priority || 'Medium') === 'High'
                      ? '🔥'
                      : (task.priority || 'Medium') === 'Low'
                        ? '🌱'
                        : '⚡'}
                  </span>
                  {task.priority || 'Medium'} Priority
                </span>

                {isShifted && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Shifted
                  </span>
                )}

                {task.completed && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>

              {/* Shifted Date Info (if applicable) */}
              {isShifted && (
                <div className="px-4 py-3 mt-2 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-sm font-medium text-orange-700">
                      Originally scheduled for{' '}
                      <span className="font-semibold">
                        {format(
                          normalizeDateLocal(task?.originalDate) || new Date(),
                          'MMM dd, yyyy'
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Row: Completion Button - Centered and Prominent */}
              <div className="flex justify-center mt-6">
                <Button
                  variant={task.completed ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={() => {
                    if (!task?.id) {
                      console.error('Task ID is undefined in completion button:', task)
                      showToast('Cannot update task: Invalid task ID', 'error')
                      return
                    }

                    const newStatus = !task.completed
                    updateTask(task.id, { completed: newStatus })
                    showToast(
                      newStatus ? 'Task marked as completed! 🎉' : 'Task marked as incomplete',
                      'success'
                    )
                  }}
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    task.completed
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 border-2 border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg'
                  }`}
                >
                  {task.completed ? (
                    <>
                      <svg
                        className="w-6 h-6 mr-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      <span className="text-lg">Completed</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded border-2 border-current flex items-center justify-center mr-3">
                        <div className="w-3 h-3 rounded-full bg-current"></div>
                      </div>
                      <span className="text-lg">Mark Done</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative flex-shrink-0" ref={actionsRef}>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-slate-100 transition-all duration-200"
                aria-label="More options"
                onClick={() => setShowActions((v) => !v)}
              >
                <MoreVertical size={18} className="text-slate-600" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-12 z-10 w-64 bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700">Task Actions</h4>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowActions(false)
                        onShowChangeDate?.()
                      }}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <Calendar size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">Change date</div>
                        <div className="text-xs text-slate-500">Reschedule this task</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowActions(false)
                        const now = new Date()
                        const pad = (n) => String(n).padStart(2, '0')
                        const toDate = (d) =>
                          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
                        const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
                        onShowAddTime?.()
                      }}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                        <Clock size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">Add time</div>
                        <div className="text-xs text-slate-500">Log manual work time</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowActions(false)
                        onShowCopyModal?.()
                      }}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                        <CopyIcon size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">Copy task</div>
                        <div className="text-xs text-slate-500">Duplicate with new settings</div>
                      </div>
                    </button>

                    <div className="border-t border-slate-200 my-2"></div>

                    <button
                      onClick={async () => {
                        setShowActions(false)
                        onDelete?.()
                      }}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-red-50 transition-colors duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                        <Trash2 size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">Delete task</div>
                        <div className="text-xs text-red-500">Remove permanently</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          {/* Top Row: Timer Controls */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock size={18} className="text-slate-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Timer</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isTimerActive ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onStopTimer?.(task.id)
                    showToast('Timer stopped!', 'success')
                  }}
                  className="px-4 py-2 rounded-xl font-medium"
                >
                  <Pause size={16} />
                  <span className="ml-2">Stop Timer</span>
                </Button>
              ) : task.completed ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled
                  title="Task is completed"
                  className="px-4 py-2 rounded-xl font-medium opacity-60 cursor-not-allowed"
                >
                  <Play size={16} />
                  <span className="ml-2">Start Timer</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onStartTimer?.(task.id)
                    showToast('Timer started! ⏱️', 'success')
                  }}
                  className="px-4 py-2 rounded-xl font-medium"
                >
                  <Play size={16} />
                  <span className="ml-2">Start Timer</span>
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onShowShiftModal?.()
                  showToast('Task shifted to tomorrow! 📅', 'success')
                }}
                className="px-4 py-2 rounded-xl font-medium"
              >
                <ArrowRight size={16} />
                <span className="ml-2">Shift to Tomorrow</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Edit size={18} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Description</h3>
            </div>
            <Button
              variant="ghost"
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-600 hover:text-slate-900"
              onClick={() => {
                onEditDescription?.(task.id)
              }}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          </div>

          <div className="min-h-[80px]">
            {task.description ? (
              <div
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            ) : (
              <div className="flex items-center justify-center h-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <Edit size={24} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">No description added</p>
                  <p className="text-xs text-slate-400">Click edit to add a description</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Priority</h3>
          </div>

          <div className="flex items-center gap-3">
            {['High', 'Medium', 'Low'].map((p) => {
              const getPriorityColors = (priority, isSelected) => {
                switch (priority) {
                  case 'High':
                    return isSelected
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                      : 'border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                  case 'Medium':
                    return isSelected
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-amber-200 bg-white text-amber-600 hover:border-amber-300 hover:bg-amber-50'
                  case 'Low':
                    return isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-emerald-200 bg-white text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'
                  default:
                    return isSelected
                      ? 'border-slate-500 bg-slate-50 text-slate-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
                <label
                  key={p}
                  className={`px-4 h-[42px] flex items-center rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium ${getPriorityColors(p, (task.priority || 'Medium') === p)}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    className="sr-only"
                    onChange={() => {
                      if (!task?.id) {
                        console.error('Task ID is undefined in priority change:', task)
                        showToast('Cannot update task: Invalid task ID', 'error')
                        return
                      }
                      updateTask(task.id, { priority: p })
                    }}
                    checked={(task.priority || 'Medium') === p}
                  />
                  {getPriorityIcon(p)} {p}
                </label>
              )
            })}
          </div>
        </div>

        {/* Labels Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Tag size={18} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Labels</h3>
          </div>

          <div className="space-y-4">
            {/* Existing Labels */}
            {task.labels && task.labels.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {task.labels.map((label) => (
                  <LabelBadge
                    key={label}
                    label={label}
                    onRemove={handleRemoveLabel}
                    showRemoveButton={true}
                    size="default"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500">
                <Tag size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm">No labels added yet</p>
              </div>
            )}

            {/* Add New Label */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                placeholder="Enter label name"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <Button
                variant="primary"
                size="icon"
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Checklist Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <List size={18} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Checklist</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                {completedChecklistItems}/{totalChecklistItems}
              </span>
            </div>

            {/* Progress Bar */}
            {totalChecklistItems > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  {Math.round((completedChecklistItems / totalChecklistItems) * 100)}%
                </span>
                <div className="w-24 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Checklist Items */}
            {task.checklist && task.checklist.length > 0 ? (
              task.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                >
                  {item && (
                    <Checkbox
                      checked={item.done}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="flex-shrink-0"
                    />
                  )}
                  <span
                    className={`flex-1 text-sm font-medium ${
                      item.done ? 'text-slate-500 line-through' : 'text-slate-900'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                  >
                    <X size={14} className="text-red-600" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <List size={32} className="mx-auto mb-3 text-slate-400" />
                <p className="text-sm font-medium">No checklist items yet</p>
                <p className="text-xs text-slate-400">Add items to break down your task</p>
              </div>
            )}

            {/* Add New Item */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                placeholder="Add a new checklist item..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <Button
                variant="primary"
                size="icon"
                onClick={handleAddChecklistItem}
                disabled={!newChecklistItem.trim()}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Paperclip size={18} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
              {localAttachments?.length || 0}/3
            </span>
          </div>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors duration-200">
              <input
                id={attachmentInputId}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  // Check file size (20MB limit) - 20971520 bytes exactly as specified
                  const maxSize = 20971520 // 20 MB in bytes
                  if (file.size > maxSize) {
                    showToast(
                      'The file is too large. Please upload a file smaller than 20 MB.',
                      'error'
                    )
                    if (e.target) e.target.value = ''
                    return
                  }

                  if (reachedAttachmentLimit) {
                    showToast('Attachment limit reached (max 3 per task)', 'warning')
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
                    showToast(`File "${file.name}" uploaded successfully!`, 'success')
                  } catch (err) {
                    console.error('Attachment upload failed:', err)
                    const message = err?.message || 'Failed to upload. Please try again.'
                    showToast(message, 'error')
                  } finally {
                    setIsUploading(false)
                    if (e.target) e.target.value = ''
                  }
                }}
              />

              <label
                htmlFor={isUploading || reachedAttachmentLimit ? undefined : attachmentInputId}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                  isUploading || reachedAttachmentLimit
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                }`}
                aria-disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Paperclip size={18} />
                    {reachedAttachmentLimit ? 'Max 3 attachments' : 'Choose file to attach'}
                  </>
                )}
              </label>

              {pendingAttachmentName && (
                <div className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <span className="font-medium">Selected:</span> {pendingAttachmentName}
                </div>
              )}

              {uploadError && (
                <div className="mt-3 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}
            </div>

            {/* Attachment List */}
            {localAttachments && localAttachments.length > 0 ? (
              <div className="space-y-3">
                {localAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                      <Paperclip size={18} className="text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-slate-500">Click to view or download</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (attachment.url) {
                            onPreviewAttachment?.(attachment.url, attachment.name)
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-200"
                        title="View attachment"
                        aria-label={`View ${attachment.name}`}
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await removeAttachment(task.id, attachment)
                            setLocalAttachments((prev) => prev.filter((_, i) => i !== index))
                            showToast(
                              `Attachment "${attachment.name}" removed successfully!`,
                              'success'
                            )
                          } catch (error) {
                            console.error('Failed to remove attachment:', error)
                            showToast('Failed to remove attachment. Please try again.', 'error')
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                        title="Remove attachment"
                        aria-label={`Remove ${attachment.name}`}
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Paperclip size={32} className="mx-auto mb-3 text-slate-400" />
                <p className="text-sm font-medium">No attachments yet</p>
                <p className="text-xs text-slate-400">
                  Upload files to keep them organized with your task
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {/* This modal is now handled by the parent component */}
    </>
  )
}
