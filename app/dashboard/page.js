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
import Button from '@/components/Button'

import {
  SquareCheck,
  FileText,
  Calendar,
  Target,
  Clock,
  Plus,
  CheckCircle,
  Clock as ClockIcon,
} from 'lucide-react'

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
    if (!user || loading) {
      // Clear data when user is not authenticated
      setDashboardData({
        tasks: [],
        events: [],
        habits: [],
        notes: [],
        sheets: [],
      })
      setStats({
        todayTasks: 0,
        totalEvents: 0,
        totalHabits: 0,
        totalNotes: 0,
        totalSheets: 0,
        completedTasks: 0,
        focusTime: 0,
      })
      return
    }

    let unsubscribeTasks = () => {}
    let unsubscribeEvents = () => {}
    let unsubscribeHabits = () => {}
    let unsubscribeSheets = () => {}

    try {
      unsubscribeTasks = subscribeToTasks(user.uid, (tasks) => {
        setDashboardData((prev) => ({ ...prev, tasks }))
      })

      unsubscribeEvents = subscribeToEvents(user.uid, (events) => {
        setDashboardData((prev) => ({ ...prev, events }))
      })

      unsubscribeHabits = subscribeToHabits(user.uid, (habits) => {
        setDashboardData((prev) => ({ ...prev, habits }))
      })

      unsubscribeSheets = subscribeToSheets(user.uid, (sheets) => {
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
    } catch (error) {
      console.error('Error setting up subscriptions:', error)
    }

    return () => {
      // Clean up all subscriptions
      try {
        unsubscribeTasks()
        unsubscribeEvents()
        unsubscribeHabits()
        unsubscribeSheets()
      } catch (error) {
        console.error('Error cleaning up subscriptions:', error)
      }
    }
  }, [user?.uid, loading]) // Removed showToast from dependencies to prevent infinite loop

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
        <div className="text-slate-500 text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-lg">Please log in to view dashboard</div>
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2 font-display">Dashboard</h1>
          <p className="text-slate-600 font-body">
            Welcome back! Here's your productivity overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tasks Stats */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <SquareCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900 font-display">
                  {stats.todayTasks}
                </div>
                <div className="text-sm text-slate-500 font-body">Today's Tasks</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 font-body">{stats.completedTasks} completed</div>
          </div>

          {/* Focus Time */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900 font-display">
                  {formatFocusTime(stats.focusTime)}
                </div>
                <div className="text-sm text-slate-500 font-body">Focus Time</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 font-body">Today</div>
          </div>

          {/* Habits */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900 font-display">
                  {stats.totalHabits}
                </div>
                <div className="text-sm text-slate-500 font-body">Active Habits</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 font-body">Total</div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900 font-display">
                  {stats.totalNotes}
                </div>
                <div className="text-sm text-slate-500 font-body">Total Notes</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 font-body">Ideas captured</div>
          </div>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Box */}
          <div
            className="bg-white rounded-lg p-5 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => router.push('/tasks')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 font-display">Tasks</h3>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-indigo-600" />
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2 font-display">
                <SquareCheck className="w-4 h-4 text-indigo-500" />
                Recent Tasks
              </h4>
              {dashboardData.tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-800 truncate flex-1 font-body">
                      {task.title}
                    </div>
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-body">
                    {task.completed ? 'Completed' : 'Pending'}
                  </div>
                </div>
              ))}
              {dashboardData.tasks.length === 0 && (
                <div className="text-sm text-slate-400 italic text-center py-4 font-body">
                  No tasks yet
                </div>
              )}
            </div>
          </div>

          {/* Notes Box */}
          <div
            className="bg-white rounded-lg p-5 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => router.push('/notes')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 font-display">Notes</h3>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-amber-600" />
              </div>
            </div>

            {/* Recent Notes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2 font-display">
                <FileText className="w-4 h-4 text-amber-500" />
                Recent Notes
              </h4>
              {dashboardData.notes.slice(0, 3).map((note) => (
                <div key={note.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-sm font-medium text-slate-800 truncate mb-1 font-body">
                    {note.title}
                  </div>
                  <div className="text-xs text-slate-600 truncate font-body">
                    {note.description || 'No description'}
                  </div>
                </div>
              ))}
              {dashboardData.notes.length === 0 && (
                <div className="text-sm text-slate-400 italic text-center py-4 font-body">
                  No notes yet
                </div>
              )}
            </div>
          </div>

          {/* Calendar Box */}
          <div
            className="bg-white rounded-lg p-5 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => router.push('/calendar')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 font-display">Calendar</h3>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2 font-display">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Upcoming Events
              </h4>
              {dashboardData.events.slice(0, 3).map((event) => (
                <div key={event.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-sm font-medium text-slate-800 truncate mb-1 font-body">
                    {event.name}
                  </div>
                  <div className="text-xs text-slate-600 font-body">
                    {event.date} at {event.time}
                  </div>
                </div>
              ))}
              {dashboardData.events.length === 0 && (
                <div className="text-sm text-slate-400 italic text-center py-4 font-body">
                  No events scheduled
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 font-display">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="secondary"
              className="p-4 h-auto"
              onClick={() => handleQuickAction('task')}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-sm font-medium text-slate-700 font-body">Add Task</div>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="p-4 h-auto"
              onClick={() => handleQuickAction('event')}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-sm font-medium text-slate-700 font-body">Add Event</div>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="p-4 h-auto"
              onClick={() => handleQuickAction('habit')}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-slate-700 font-body">Add Habit</div>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="p-4 h-auto"
              onClick={() => handleQuickAction('note')}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-sm font-medium text-slate-700 font-body">Add Note</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  )
}
