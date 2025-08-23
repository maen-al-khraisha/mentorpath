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

import { ChevronLeft, ChevronRight, Plus, Play, Pause, Clock, ArrowRight, X } from 'lucide-react'
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
      return priorityOk && labelOk
    })
  }

  const todo = applyFilters(tasks.filter((t) => !t.completed))
  const completed = applyFilters(tasks.filter((t) => t.completed))
  const selectedTask = useMemo(() => tasks.find((t) => t.id === selectedId), [tasks, selectedId])

  // Auto-select first task (prefer first To Do) when list loads
  useEffect(() => {
    const visible = [...todo, ...completed]
    if (!visible.find((t) => t.id === selectedId)) {
      const firstTodo = todo[0]
      const first = firstTodo || visible[0]
      if (first) setSelectedId(first.id)
      else setSelectedId(null)
    }
  }, [tasks, priorityFilter, labelFilter])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading...</div>
          <div className="text-sm text-[var(--neutral-700)]">
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
          <div className="text-lg font-semibold mb-2">Authentication Required</div>
          <div className="text-sm text-[var(--neutral-700)]">Please sign in to view your tasks</div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:grid lg:grid-cols-4 lg:gap-4">
      {/* Full-width KPI header row */}
      <div className="lg:col-span-4 space-y-2 mb-2">
        <div className="grid grid-cols-3  sm:grid-cols-3 gap-10">
          <div
            className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-md 
            cursor-pointer
             hover:bg-white/80 hover:border-gray-300
             transition-all duration-200 transform hover:shadow-xl"
          >
            <div className="flex items-start justify-between relative">
              <div className="sketch-title text-[26px]">Task Completed</div>
              <div className="flex items-center absolute top-0 right-0">
                <Image src="/icons/done-badge.png" alt="Done" width={40} height={40} />
              </div>
            </div>
            <div className="sketch-count mt-2 ">
              {completed.length.toString().padStart(1, '0')} /
              {tasks.length.toString().padStart(1, '0')}
            </div>
          </div>
          <div
            className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-md 
            cursor-pointer
             hover:bg-white/80 hover:border-gray-300
             transition-all duration-200 transform hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="sketch-title text-[26px]">Focus Time Today</div>
              <Image src="/icons/focus.png" alt="Done" width={40} height={40} />
            </div>
            <div className="sketch-count mt-2">{formatTotalTime(getTotalFocusTime())}</div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="sketchButton"
              href="/insights"
              className="h-min flex align-center justify-center"
            >
              <span>Insights</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Left column (2fr) */}
      <div className="space-y-3 lg:col-span-2">
        {/* Toolbar */}
        <div className="flex  items-center gap-2 justify-between">
          <div className="flex items-center gap-1 border px-1 py-1 rounded-md bg-[var(--bg-card)] flex-1">
            <Button
              variant="ghost"
              className="p-1"
              onClick={() => setDate((d) => new Date(d.getTime() - 86400000))}
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="px-3 h-9 inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-sm">
              {date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </div>
            <Button
              variant="ghost"
              className="p-1"
              onClick={() => setDate((d) => new Date(d.getTime() + 86400000))}
              aria-label="Next day"
            >
              <ChevronRight size={16} />
            </Button>
            <select
              className="h-9 ml-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
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
          </div>

          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} />
            <span className="ml-1">Add task</span>
          </Button>
        </div>

        {/* Lists */}
        <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 shadow-soft">
          <div className="font-semibold mb-2">To Do</div>
          <ul className="space-y-2">
            {todo.map((t) => (
              <li
                key={t.id}
                className={`rounded-md border border-[var(--border)] p-2 transition-colors ${selectedId === t.id ? 'bg-green-50' : 'bg-[var(--bg-card)]'}`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={!!t.completed}
                    onChange={(e) => toggleTaskCompleted(t.id, e.target.checked)}
                    aria-label="Complete task"
                  />
                  <button className="flex-1 text-left" onClick={() => setSelectedId(t.id)}>
                    {t.title}
                  </button>
                  <span className="text-xs font-mono text-green-700 min-w-[60px] text-right">
                    {formatTotalTime(getTaskTotalTime(t.id))}
                  </span>
                  {activeTimer && activeTimer.taskId === t.id ? (
                    <button
                      className="p-1.5 rounded-md border border-green-500 bg-green-50 text-green-700 flex items-center gap-1"
                      aria-label="Stop timer"
                      onClick={() => handleStopTimer(t.id)}
                    >
                      <Pause size={14} />
                      <span className="text-xs font-mono">
                        {formatElapsedTime(activeTimer.startTime)}
                      </span>
                    </button>
                  ) : (
                    !t.completed && (
                      <Button
                        variant="primary"
                        className="p-1"
                        aria-label="Start timer"
                        onClick={() => handleStartTimer(t.id)}
                      >
                        <Play size={14} />
                      </Button>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 shadow-soft">
          <div className="font-semibold mb-2">Completed</div>
          <ul className="space-y-2">
            {completed.map((t) => (
              <li
                key={t.id}
                className={`rounded-md border border-[var(--border)] p-2 opacity-80 transition-colors ${selectedId === t.id ? 'bg-green-50' : 'bg-[var(--bg-card)]'}`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={!!t.completed}
                    onChange={(e) => toggleTaskCompleted(t.id, e.target.checked)}
                    aria-label="Completed"
                  />
                  <button
                    className="flex-1 text-left line-through"
                    onClick={() => setSelectedId(t.id)}
                  >
                    {t.title}
                  </button>
                  <span className="text-xs font-mono text-green-700 min-w-[60px] text-right">
                    {formatTotalTime(getTaskTotalTime(t.id))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Mobile/md details modal */}
      {selectedTask && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedId(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold">Task Details</h3>
              <button
                className="px-2 py-1 rounded-md border border-[var(--border)]"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
              >
                Close
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop TaskDetailsPanel */}
      <aside className="hidden lg:block lg:col-span-2">
        <div className="sticky top-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft min-h-[320px] max-h-[calc(100vh-6rem)] overflow-y-auto">
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
          />
        </div>
      </aside>

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
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShiftModal(false)} />
          <div className="relative bg-white border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
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
      {showChangeDate && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowChangeDate(false)} />
          <div className="relative bg-white border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
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
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm"
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
      {showAddTime && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddTime(false)} />
          <div className="relative bg-white border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
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
      {showCopyModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCopyModal(false)} />
          <div className="relative bg-white border border-[var(--border)] rounded-lg p-4 shadow-soft w-full max-w-md">
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
          <div className="relative bg-white border border-[var(--border)] rounded-lg shadow-soft w-[90vw] max-w-3xl max-h-[90vh] overflow-hidden">
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
