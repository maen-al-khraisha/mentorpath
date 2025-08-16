'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToTasks } from '@/lib/tasksApi'
import { subscribeToEvents } from '@/lib/eventsApi'
import { subscribeToHabits } from '@/lib/habitsApi'
import { subscribeToSheets } from '@/lib/sheetsApi'
import { getNotes, getAllLabels } from '@/lib/notesApi'
import { useToast } from '@/components/Toast'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    events: [],
    habits: [],
    notes: [],
    sheets: [],
  })
  const [stats, setStats] = useState({
    todayTasks: 0,
    totalEvents: 0,
    totalHabits: 0,
    totalNotes: 0,
    totalSheets: 0,
    completedTasks: 0,
    focusTime: 0,
  })

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || loading) return

    const unsubscribeTasks = subscribeToTasks(user.uid, (tasks) => {
      setDashboardData((prev) => ({ ...prev, tasks }))
    })

    const unsubscribeEvents = subscribeToEvents(user.uid, (events) => {
      setDashboardData((prev) => ({ ...prev, events }))
    })

    const unsubscribeHabits = subscribeToHabits(user.uid, (habits) => {
      setDashboardData((prev) => ({ ...prev, habits }))
    })

    const unsubscribeSheets = subscribeToSheets(user.uid, (sheets) => {
      setDashboardData((prev) => ({ ...prev, sheets }))
    })

    // Load notes (IndexedDB doesn't have real-time updates)
    const loadNotes = async () => {
      try {
        const notes = await getNotes(user.uid)
        setDashboardData((prev) => ({ ...prev, notes }))
      } catch (error) {
        console.error('Failed to load notes:', error)
        showToast('Failed to load notes', 'error')
      }
    }
    loadNotes()

    return () => {
      unsubscribeTasks()
      unsubscribeEvents()
      unsubscribeHabits()
      unsubscribeSheets()
    }
  }, [user, loading, showToast])

  // Calculate stats when data changes
  useEffect(() => {
    if (
      !dashboardData.tasks.length &&
      !dashboardData.events.length &&
      !dashboardData.habits.length &&
      !dashboardData.notes.length
    )
      return

    const today = new Date()
    const todayKey = today.toISOString().split('T')[0]

    // Calculate today's tasks
    const todayTasks = dashboardData.tasks.filter((task) => task.dateKey === todayKey).length

    // Calculate completed tasks today
    const completedTasks = dashboardData.tasks.filter(
      (task) => task.dateKey === todayKey && task.completed
    ).length

    // Calculate total focus time today
    const focusTime = dashboardData.tasks.reduce((total, task) => {
      if (task.dateKey === todayKey && task.workSessions) {
        return (
          total +
          task.workSessions.reduce(
            (sessionTotal, session) => sessionTotal + (session.durationSec || 0),
            0
          )
        )
      }
      return total
    }, 0)

    setStats({
      todayTasks,
      totalEvents: dashboardData.events.length,
      totalHabits: dashboardData.habits.length,
      totalNotes: dashboardData.notes.length,
      totalSheets: dashboardData.sheets.length,
      completedTasks,
      focusTime: Math.round(focusTime / 60), // Convert to minutes
    })
  }, [dashboardData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Please log in to view dashboard</div>
      </div>
    )
  }

  const formatFocusTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'task':
        router.push('/tasks')
        break
      case 'event':
        router.push('/calendar')
        break
      case 'habit':
        router.push('/habits')
        break
      case 'note':
        router.push('/notes')
        break
      default:
        break
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome back, {user.email}</div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tasks Box */}
          <div
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-soft cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 transform hover:scale-105"
            onClick={() => router.push('/tasks')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-700">Tasks</h3>
              <div className="text-2xl font-bold text-blue-600">{stats.todayTasks}</div>
            </div>
            <div className="text-sm text-blue-600 mb-3">{stats.completedTasks} completed today</div>

            {/* Recent Tasks */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Recent Tasks</h4>
              {dashboardData.tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="bg-white/50 rounded p-2 border border-blue-100">
                  <div className="text-sm font-medium text-blue-800 truncate">{task.title}</div>
                  <div className="text-xs text-blue-600">
                    {task.completed ? '✅ Completed' : '⏳ Pending'}
                  </div>
                </div>
              ))}
              {dashboardData.tasks.length === 0 && (
                <div className="text-xs text-blue-500 italic">No tasks yet</div>
              )}
            </div>
          </div>

          {/* Notes Box */}
          <div
            className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-soft cursor-pointer hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200 transform hover:scale-105"
            onClick={() => router.push('/notes')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-yellow-700">Notes</h3>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalNotes}</div>
            </div>
            <div className="text-sm text-yellow-600 mb-3">Total notes</div>

            {/* Recent Notes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-yellow-700 mb-2">Recent Notes</h4>
              {dashboardData.notes.slice(0, 3).map((note) => (
                <div key={note.id} className="bg-white/50 rounded p-2 border border-yellow-100">
                  <div className="text-sm font-medium text-yellow-800 truncate">{note.title}</div>
                  <div className="text-xs text-yellow-600">
                    {note.description?.substring(0, 30)}...
                  </div>
                </div>
              ))}
              {dashboardData.notes.length === 0 && (
                <div className="text-xs text-yellow-500 italic">No notes yet</div>
              )}
            </div>
          </div>

          {/* Calendar Box */}
          <div
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow-soft cursor-pointer hover:bg-green-100 hover:border-green-300 transition-all duration-200 transform hover:scale-105"
            onClick={() => router.push('/calendar')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-700">Calendar</h3>
              <div className="text-2xl font-bold text-green-600">{stats.totalEvents}</div>
            </div>
            <div className="text-sm text-green-600 mb-3">Total events</div>

            {/* Recent Events */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-700 mb-2">Upcoming Events</h4>
              {dashboardData.events.slice(0, 3).map((event) => (
                <div key={event.id} className="bg-white/50 rounded p-2 border border-green-100">
                  <div className="text-sm font-medium text-green-800 truncate">{event.name}</div>
                  <div className="text-xs text-green-600">
                    {event.date} at {event.time}
                  </div>
                </div>
              ))}
              {dashboardData.events.length === 0 && (
                <div className="text-xs text-green-500 italic">No events scheduled</div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="text-sm text-neutral-700 mb-1">Focus Time Today</div>
            <div className="text-2xl font-semibold text-blue-600">
              {formatFocusTime(stats.focusTime)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {stats.focusTime > 0 ? 'Great progress!' : 'Start your first task'}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="text-sm text-neutral-700 mb-1">Habits</div>
            <div className="text-2xl font-semibold text-purple-600">{stats.totalHabits}</div>
            <div className="text-xs text-neutral-500 mt-1">
              {stats.totalHabits > 0 ? 'Active habits' : 'No habits yet'}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="text-sm text-neutral-700 mb-1">Task Completion</div>
            <div className="text-2xl font-semibold text-purple-600">
              {stats.todayTasks > 0
                ? Math.round((stats.completedTasks / stats.todayTasks) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {stats.todayTasks > 0 ? "Today's progress" : 'No tasks today'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              onClick={() => handleQuickAction('task')}
            >
              <div className="text-sm font-medium text-blue-700">Add Task</div>
              <div className="text-xs text-blue-600 mt-1">Create new task</div>
            </button>
            <button
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              onClick={() => handleQuickAction('event')}
            >
              <div className="text-sm font-medium text-green-700">Add Event</div>
              <div className="text-xs text-green-600 mt-1">Schedule event</div>
            </button>
            <button
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              onClick={() => handleQuickAction('habit')}
            >
              <div className="text-sm font-medium text-purple-700">Add Habit</div>
              <div className="text-xs text-purple-600 mt-1">Track daily habit</div>
            </button>
            <button
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              onClick={() => handleQuickAction('note')}
            >
              <div className="text-sm font-medium text-yellow-700">Add Note</div>
              <div className="text-xs text-yellow-600 mt-1">Quick note</div>
            </button>
          </div>
        </div> */}
      </div>

      <ToastContainer />
    </>
  )
}
