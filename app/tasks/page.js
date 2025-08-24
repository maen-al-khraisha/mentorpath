'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import {
  dayKey,
  listenTasksByDate,
  listenWorkSessionsByDate,
  toggleTaskCompleted,
  updateTask,
  startWorkSession,
  stopWorkSession,
  shiftTaskToTomorrow,
  shiftTaskToDate,
  addManualWorkSession,
  createTask,
} from '@/lib/tasksApi'
import TaskAddModal from './TaskAddModal'
import TaskDetailsPanel from './TaskDetailsPanel'
import DescriptionEditModal from './DescriptionEditModal'

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Pause,
  Clock,
  ArrowRight,
  X,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Search,
  ListTodo,
  FileText,
} from 'lucide-react'
import Image from 'next/image'
import Checkbox from '@/components/ui/AnimatedCheckbox'
import Button from '@/components/Button'

export default function TasksPage() {
  const { user, loading } = useAuth()
  const [date, setDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [workSessions, setWorkSessions] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [activeTimer, setActiveTimer] = useState(null)
  const [timerTick, setTimerTick] = useState(0)
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [labelFilter, setLabelFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')

  // Modal states
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [shiftReason, setShiftReason] = useState('')
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
  const [copyPriority, setCopyPriority] = useState('Medium')
  const [copyDescription, setCopyDescription] = useState('')
  const [copyLabels, setCopyLabels] = useState(true)
  const [copyChecklist, setCopyChecklist] = useState(true)
  const [isSubmittingCopy, setIsSubmittingCopy] = useState(false)
  const [previewItem, setPreviewItem] = useState(null) // { url, name }
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)

  // Modal handlers
  const handleShiftToTomorrow = async () => {
    if (!selectedTask) return
    try {
      await shiftTaskToTomorrow(selectedTask.id, shiftReason)
      setShowShiftModal(false)
      setShiftReason('')
    } catch (e) {
      console.error('Shift to tomorrow failed', e)
    }
  }

  const handlePreviewAttachment = (attachment) => {
    setPreviewItem({ url: attachment.url, name: attachment.name })
  }

  const handleSaveDescription = async (newDescription) => {
    if (
      editingTaskId &&
      newDescription !== tasks.find((t) => t.id === editingTaskId)?.description
    ) {
      await updateTask(editingTaskId, { description: newDescription })
      setShowDescriptionModal(false)
      setEditingTaskId(null)
    }
  }

  const handleShowCopyModal = () => {
    if (selectedTask) {
      setCopyTitle(selectedTask.title || '')
      setCopyDate('')
      setCopyDescription(selectedTask.description || '')
      setCopyPriority(selectedTask.priority || 'Medium')
      setCopyLabels(true)
      setCopyChecklist(true)
      setShowCopyModal(true)
    }
  }

  useEffect(() => {
    if (!user || loading) {
      setTasks([])
      setWorkSessions([])
      return
    }
    const unsubTasks = listenTasksByDate(date, user.uid, setTasks)
    const unsubSessions = listenWorkSessionsByDate(date, user.uid, setWorkSessions)
    return () => {
      unsubTasks && unsubTasks()
      unsubSessions && unsubSessions()
    }
  }, [user, loading, date])

  // Helper to sum total work time for a task (in seconds)
  function getTaskTotalTime(taskId) {
    const sessions = workSessions.filter((s) => s.taskId === taskId)
    let total = 0
    sessions.forEach((s) => {
      if (s.startAt && s.endAt) {
        if (typeof s.durationSec === 'number') {
          total += Math.max(0, s.durationSec)
        } else {
          const start = s.startAt.toDate ? s.startAt.toDate() : new Date(s.startAt)
          const end = s.endAt.toDate ? s.endAt.toDate() : new Date(s.endAt)
          total += Math.max(0, (end - start) / 1000)
        }
      } else if (s.startAt && activeTimer && activeTimer.taskId === taskId) {
        // If session is running, add live time
        const start = s.startAt.toDate ? s.startAt.toDate() : new Date(s.startAt)
        const now = new Date()
        total += Math.max(0, (now - start) / 1000)
      }
    })
    return total
  }

  // Sum of all work sessions for the selected day (respects date filter)
  function getTotalFocusTime() {
    let total = 0
    workSessions.forEach((s) => {
      if (!s.startAt) return
      const start = s.startAt.toDate ? s.startAt.toDate() : new Date(s.startAt)
      if (s.endAt) {
        if (typeof s.durationSec === 'number') {
          total += Math.max(0, s.durationSec)
        } else {
          const end = s.endAt.toDate ? s.endAt.toDate() : new Date(s.endAt)
          total += Math.max(0, (end - start) / 1000)
        }
      } else if (activeTimer && activeTimer.sessionId && s.id === activeTimer.sessionId) {
        const now = new Date()
        total += Math.max(0, (now - start) / 1000)
      }
    })
    return total
  }

  function formatTotalTime(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const allLabels = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => (t.labels || []).forEach((l) => set.add(l)))
    return Array.from(set).sort()
  }, [tasks])

  function applyFilters(list) {
    return list.filter((t) => {
      const priorityOk = priorityFilter === 'All' || (t.priority || 'Medium') === priorityFilter
      const labelOk = labelFilter === 'All' || (t.labels || []).includes(labelFilter)
      const searchOk = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
      return priorityOk && labelOk && searchOk
    })
  }

  const todo = applyFilters(tasks.filter((t) => !t.completed))
  const completed = applyFilters(tasks.filter((t) => t.completed))
  const selectedTask = useMemo(() => tasks.find((t) => t.id === selectedId), [tasks, selectedId])

  // Auto-select first task when list loads
  useEffect(() => {
    const visible = [...todo, ...completed]
    if (!visible.find((t) => t.id === selectedId)) {
      const firstTodo = todo[0]
      const first = firstTodo || visible[0]
      if (first) setSelectedId(first.id)
      else setSelectedId(null)
    }
  }, [tasks, priorityFilter, labelFilter, searchQuery, todo, completed, selectedId])

  // Timer tick for live counter
  useEffect(() => {
    let interval
    if (activeTimer) {
      interval = setInterval(() => setTimerTick((t) => t + 1), 1000)
    } else {
      setTimerTick(0)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const handleStartTimer = async (taskId) => {
    if (!user) return
    try {
      const session = await startWorkSession(taskId)
      setActiveTimer({
        taskId,
        startTime: new Date(),
        sessionId: session.id,
      })
    } catch (error) {
      console.error('Failed to start timer:', error)
    }
  }

  const handleStopTimer = async (taskId) => {
    if (!user || !activeTimer) return
    try {
      await stopWorkSession(activeTimer.sessionId)
      setActiveTimer(null)
    } catch (error) {
      console.error('Failed to stop timer:', error)
    }
  }

  // Helper to format elapsed time
  function formatElapsedTime(startTime) {
    if (!startTime) return '00:00:00'
    const start = new Date(startTime)
    const now = new Date()
    const diff = Math.floor((now - start) / 1000) + timerTick
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    const s = diff % 60
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">Loading...</div>
          <div className="text-sm text-slate-600 font-body">
            Authenticating and loading your tasks
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">
            Authentication Required
          </div>
          <div className="text-sm text-slate-600 font-body">Please sign in to view your tasks</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 font-display bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Task Management
            </h1>
            <p className="text-lg text-slate-600 font-body mt-2">
              Organize, track, and complete your daily objectives with precision
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Create Task
          </Button>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-display">
                  {completed.length}/{tasks.length}
                </div>
                <div className="text-sm text-slate-600 font-body">Tasks Completed</div>
                <div className="text-xs text-emerald-600 font-medium">
                  {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
                  success rate
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Clock3 size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-display">
                  {formatTotalTime(getTotalFocusTime())}
                </div>
                <div className="text-sm text-slate-600 font-body">Focus Time Today</div>
                <div className="text-xs text-blue-600 font-medium">Productivity tracking</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-display">{todo.length}</div>
                <div className="text-sm text-slate-600 font-body">Active Tasks</div>
                <div className="text-xs text-purple-600 font-medium">Ready to tackle</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-display">
                  {Math.round((completed.length / Math.max(tasks.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-slate-600 font-body">Progress</div>
                <div className="text-xs text-amber-600 font-medium">Daily achievement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Toolbar - Full Width */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="p-3 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={() => setDate((d) => new Date(d.getTime() - 86400000))}
              aria-label="Previous day"
            >
              <ChevronLeft size={20} />
            </Button>
            <div className="px-6 py-3 bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl text-lg font-semibold text-slate-900 font-display border border-slate-200">
              <Calendar size={18} className="inline mr-2 text-blue-600" />
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}
            </div>
            <Button
              variant="ghost"
              className="p-3 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={() => setDate((d) => new Date(d.getTime() + 86400000))}
              aria-label="Next day"
            >
              <ChevronRight size={20} />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority"
              >
                <option value="All">All priorities</option>
                <option value="High">High priority</option>
                <option value="Medium">Medium priority</option>
                <option value="Low">Low priority</option>
              </select>

              <select
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                aria-label="Filter by label"
              >
                <option value="All">All labels</option>
                {allLabels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                aria-label="Toggle view mode"
              >
                <ListTodo size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-8">
        {/* Left column - Task Lists */}
        <div className="space-y-6 lg:col-span-3">
          {/* To Do List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target size={18} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 font-display">Active Tasks</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {todo.length}
                </span>
              </div>
            </div>

            <div className="p-6">
              {todo.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 font-display mb-2">
                    No active tasks
                  </h3>
                  <p className="text-slate-600 font-body mb-4">
                    Create your first task to get started!
                  </p>
                  <Button variant="primary" onClick={() => setShowAdd(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {todo.map((t) => (
                    <li
                      key={t.id}
                      className={`group border border-slate-200 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                        selectedId === t.id
                          ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-100'
                          : 'bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={!!t.completed}
                          onChange={(e) => toggleTaskCompleted(t.id, e.target.checked)}
                          aria-label="Complete task"
                          className="mt-1 border-slate-300 bg-white"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-slate-900 font-body group-hover:text-blue-600 transition-colors">
                              {t.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(t.priority)}`}
                            >
                              {getPriorityIcon(t.priority)} {t.priority}
                            </span>
                          </div>

                          {t.labels && t.labels.length > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              {t.labels.slice(0, 3).map((label, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200"
                                >
                                  {label}
                                </span>
                              ))}
                              {t.labels.length > 3 && (
                                <span className="text-xs text-slate-500 font-body">
                                  +{t.labels.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-slate-600 font-body">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTotalTime(getTaskTotalTime(t.id))}
                              </span>
                              {t.description && (
                                <span className="flex items-center gap-1">
                                  <FileText size={14} />
                                  Has description
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {activeTimer && activeTimer.taskId === t.id ? (
                                <button
                                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center gap-2 hover:bg-red-100 transition-colors"
                                  aria-label="Stop timer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStopTimer(t.id)
                                  }}
                                >
                                  <Pause size={14} />
                                  <span className="text-sm font-mono font-body">
                                    {formatElapsedTime(activeTimer.startTime)}
                                  </span>
                                </button>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  aria-label="Start timer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartTimer(t.id)
                                  }}
                                  className="shadow-sm hover:shadow-md transition-all"
                                >
                                  <Play size={14} />
                                  <span className="ml-1">Start</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Completed List */}
          {completed.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 font-display">Completed</h2>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    {completed.length}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-3">
                  {completed.map((t) => (
                    <li
                      key={t.id}
                      className={`group border border-slate-200 rounded-xl p-4 transition-colors cursor-pointer ${
                        selectedId === t.id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50'
                      }`}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={!!t.completed}
                          onChange={(e) => toggleTaskCompleted(t.id, e.target.checked)}
                          aria-label="Completed"
                          className="border-emerald-300 bg-emerald-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-600 font-body line-through group-hover:text-slate-800 transition-colors">
                            {t.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-body">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatTotalTime(getTaskTotalTime(t.id))}
                            </span>
                            <span className="text-emerald-600 font-medium">✓ Completed</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Task Details */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            {selectedTask ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <TaskDetailsPanel
                  task={selectedTask}
                  onUpdate={updateTask}
                  onStartTimer={handleStartTimer}
                  onStopTimer={handleStopTimer}
                  activeTimer={activeTimer}
                  onShowShiftModal={() => setShowShiftModal(true)}
                  onShowChangeDate={() => setShowChangeDate(true)}
                  onShowAddTime={() => setShowAddTime(true)}
                  onShowCopyModal={handleShowCopyModal}
                  onPreviewAttachment={handlePreviewAttachment}
                  onEditDescription={(taskId) => {
                    setEditingTaskId(taskId)
                    setShowDescriptionModal(true)
                  }}
                />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 font-display mb-2">
                  Select a Task
                </h3>
                <p className="text-slate-600 font-body">
                  Choose a task from the list to view details and manage it
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Task Details Modal */}
      {selectedTask && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 font-display">Task Details</h3>
              <button
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <TaskDetailsPanel
                task={selectedTask}
                onUpdate={updateTask}
                onStartTimer={handleStartTimer}
                onStopTimer={handleStopTimer}
                activeTimer={activeTimer}
                onShowShiftModal={() => setShowShiftModal(true)}
                onShowChangeDate={() => setShowChangeDate(true)}
                onShowAddTime={() => setShowAddTime(true)}
                onShowCopyModal={handleShowCopyModal}
                onPreviewAttachment={handlePreviewAttachment}
                onEditDescription={(taskId) => {
                  setEditingTaskId(taskId)
                  setShowDescriptionModal(true)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAdd && (
        <TaskAddModal
          open={showAdd}
          onClose={(newId) => {
            setShowAdd(false)
            if (newId) {
              setSelectedId(newId)
            }
          }}
          defaultDate={date}
        />
      )}

      {/* Shift to Tomorrow Modal */}
      {showShiftModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShiftModal(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-lg p-6 shadow-soft w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 font-display">
              Shift Task to Tomorrow
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">
                  Reason (optional)
                </label>
                <textarea
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                  placeholder="Why are you shifting this task?"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-body"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShiftToTomorrow}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-body"
                >
                  Shift Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Date Modal */}
      {showChangeDate && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChangeDate(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-lg p-6 shadow-soft w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 font-display">Change Date</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">New date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  value={targetReason}
                  onChange={(e) => setTargetReason(e.target.value)}
                  placeholder="Why are you changing the date?"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-body"
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
                      await shiftTaskToDate(selectedTask.id, dt, targetReason)
                      setShowChangeDate(false)
                      setTargetDate('')
                      setTargetReason('')
                    } catch (e) {
                      console.error('Change date failed', e)
                    } finally {
                      setIsSubmittingChangeDate(false)
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-body disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingChangeDate ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Time Modal */}
      {showAddTime && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddTime(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-lg p-6 shadow-soft w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 font-display">
              Add Manual Time
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2 font-body">Start</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-sm text-slate-600 w-10 text-center font-body">
                      {Number((startTime || '0:0').split(':')[0]) >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2 font-body">Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      className="h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-sm text-slate-600 font-body">hours</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-sm text-slate-600 font-body">minutes</span>
                  </div>
                  {startDate && startTime && (
                    <div className="mt-2 text-sm text-slate-600 font-body">
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
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-body"
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
                      await addManualWorkSession(selectedTask.id, start, end)
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
                  className="inline-flex items-center rounded-lg font-medium 
                  transition-colors whitespace-nowrap
                   bg-green-600 text-white hover:bg-green-700 px-3 py-2 "
                >
                  {isSubmittingTime ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Task Modal */}
      {showCopyModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCopyModal(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-lg p-6 shadow-soft w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 font-display">Copy Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">Title</label>
                <input
                  type="text"
                  value={copyTitle}
                  onChange={(e) => setCopyTitle(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">Date</label>
                <input
                  type="date"
                  value={copyDate}
                  onChange={(e) => setCopyDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">Priority</label>
                <select
                  value={copyPriority}
                  onChange={(e) => setCopyPriority(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2 font-body">Description</label>
                <textarea
                  rows={3}
                  value={copyDescription}
                  onChange={(e) => setCopyDescription(e.target.value)}
                  placeholder="Task description..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm font-body focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center gap-4 text-sm font-body">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={copyLabels}
                    onChange={(e) => setCopyLabels(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Copy labels
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={copyChecklist}
                    onChange={(e) => setCopyChecklist(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Copy checklist
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-body"
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
                        labels: copyLabels ? selectedTask.labels || [] : [],
                        checklist: copyChecklist ? selectedTask.checklist || [] : [],
                      })
                      setShowCopyModal(false)
                    } catch (e) {
                      console.error('Copy task failed', e)
                    } finally {
                      setIsSubmittingCopy(false)
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-body disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewItem(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-lg shadow-soft w-[90vw] max-w-3xl max-h-[90vh] overflow-hidden">
            <button
              className="absolute top-3 right-3 p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              aria-label="Close"
              onClick={() => setPreviewItem(null)}
            >
              <X size={16} />
            </button>
            <div className="p-4 flex items-center justify-center w-full h-full">
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
                    <div className="mb-3 text-sm text-slate-600 font-body">
                      Preview not available for this file type.
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-body"
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

      {/* Description Edit Modal */}
      <DescriptionEditModal
        isOpen={showDescriptionModal}
        onClose={() => {
          setShowDescriptionModal(false)
          setEditingTaskId(null)
        }}
        description={
          editingTaskId ? tasks.find((t) => t.id === editingTaskId)?.description || '' : ''
        }
        onSave={handleSaveDescription}
      />
    </div>
  )
}
