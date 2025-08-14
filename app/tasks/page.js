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
} from '@/lib/tasksApi'
import TaskAddModal from './TaskAddModal'
import TaskDetailsPanel from './TaskDetailsPanel'

import { ChevronLeft, ChevronRight, Plus, Play, Pause, Clock } from 'lucide-react'
import Checkbox from '@/components/ui/AnimatedCheckbox'

export default function TasksPage() {
  const { user, loading } = useAuth()
  const [date, setDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [workSessions, setWorkSessions] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [activeTimer, setActiveTimer] = useState(null)
  const [timerTick, setTimerTick] = useState(0)

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
        const start = s.startAt.toDate ? s.startAt.toDate() : new Date(s.startAt)
        const end = s.endAt.toDate ? s.endAt.toDate() : new Date(s.endAt)
        total += Math.max(0, (end - start) / 1000)
      } else if (s.startAt && activeTimer && activeTimer.taskId === taskId) {
        // If session is running, add live time
        const start = s.startAt.toDate ? s.startAt.toDate() : new Date(s.startAt)
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

  const todo = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)
  const selectedTask = useMemo(() => tasks.find((t) => t.id === selectedId), [tasks, selectedId])

  // Auto-select first task (prefer first To Do) when list loads
  useEffect(() => {
    if (!selectedId && tasks.length > 0) {
      const firstTodo = tasks.find((t) => !t.completed)
      const first = firstTodo || tasks[0]
      if (first) setSelectedId(first.id)
    }
  }, [tasks, selectedId])

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 sketch-card sketch-green p-4">
            <div className="flex items-start justify-between">
              <div className="sketch-title">Task Completed</div>
              <div className="text-[10px] uppercase tracking-wide font-semibold">Done</div>
            </div>
            <div className="sketch-count mt-2">
              {completed.length.toString().padStart(2, '0')}/{tasks.length.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="sm:col-span-1 sketch-card sketch-pink p-4">
            <div className="flex items-start justify-between">
              <div className="sketch-title">Focus Time Today</div>
              <div className="text-[10px] uppercase tracking-wide font-semibold">Focus</div>
            </div>
            <div className="sketch-count mt-2">3h 45m</div>
          </div>
        </div>
        <div className="flex justify-end">
          <a href="/insights" className="h-9 px-3 rounded-md border border-[var(--border)] text-sm">
            Insights
          </a>
        </div>
      </div>

      {/* Left column (2fr) */}
      <div className="space-y-3 lg:col-span-2">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-1 border px-1 py-1 rounded-md bg-[var(--bg-card)] flex-1">
            <button
              className="p-2 rounded-md border border-[var(--border)]"
              onClick={() => setDate((d) => new Date(d.getTime() - 86400000))}
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-3 h-9 inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-sm">
              {date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </div>
            <button
              className="p-2 rounded-md border border-[var(--border)]"
              onClick={() => setDate((d) => new Date(d.getTime() + 86400000))}
              aria-label="Next day"
            >
              <ChevronRight size={16} />
            </button>
            <select className="h-9 ml-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm">
              <option>Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-sm">
              <option>Label</option>
              <option>work</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-9 px-3 rounded-md bg-[var(--primary)] text-[var(--neutral-900)] shadow-soft text-sm inline-flex items-center gap-2"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={16} /> Add task
            </button>
          </div>
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
                      <button
                        className="p-1.5 rounded-md border border-[var(--border)]"
                        aria-label="Start timer"
                        onClick={() => handleStartTimer(t.id)}
                      >
                        <Play size={14} />
                      </button>
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

        {showAdd && (
          <TaskAddModal open={showAdd} onClose={() => setShowAdd(false)} defaultDate={date} />
        )}
      </div>

      {/* Right column (wider details) */}
      <aside className="hidden lg:block lg:col-span-2">
        <div className="sticky top-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft min-h-[320px] max-h-[calc(100vh-6rem)] overflow-y-auto">
          <TaskDetailsPanel
            task={selectedTask}
            onUpdate={updateTask}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            activeTimer={activeTimer}
          />
        </div>
      </aside>

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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
