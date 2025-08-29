'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToTasks, listenWorkSessionsByDate } from '@/lib/tasksApi'
import InsightsFilters from './InsightsFilters'
import StatsCards from './StatsCards'
import WorkHoursChart from './WorkHoursChart'
import TaskHistory from './TaskHistory'
import TaskDetailsDrawer from './TaskDetailsDrawer'
import { CheckCircle2, Clock3, Target, TrendingUp } from 'lucide-react'

export default function InsightsPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [workSessions, setWorkSessions] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [labelFilter, setLabelFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Calculate period dates
  const getPeriodDates = () => {
    const now = new Date()
    let start, end

    if (selectedPeriod === 'week') {
      // Week starts from Sunday (0) and ends on Saturday (6)
      const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysFromSunday = currentDay

      start = new Date(now)
      start.setDate(now.getDate() - daysFromSunday) // Go back to Sunday
      start.setHours(0, 0, 0, 0) // Start of Sunday

      end = new Date(start)
      end.setDate(start.getDate() + 6) // Add 6 days to get to Saturday
      end.setHours(23, 59, 59, 999) // End of Saturday
    } else {
      // Month: from 1st to last day of the month
      start = new Date(now.getFullYear(), now.getMonth(), 1) // 1st of current month
      start.setHours(0, 0, 0, 0)

      end = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of current month
      end.setHours(23, 59, 59, 999)
    }

    return { start, end }
  }

  // Set up real-time subscription to tasks
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks(user.uid, (tasksData) => {
      setTasks(tasksData)
    })

    return () => unsubscribe()
  }, [user])

  // Fetch work sessions for the selected period
  useEffect(() => {
    if (!user) return

    const { start, end } = getPeriodDates()

    // Fetch work sessions for each day in the period
    const unsubscribes = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const unsubscribe = listenWorkSessionsByDate(currentDate, user.uid, (sessions) => {
        setWorkSessions((prev) => {
          // Remove old sessions for this date and add new ones
          const filtered = prev.filter((s) => s.dateKey !== currentDate.toISOString().split('T')[0])
          return [...filtered, ...sessions]
        })
      })
      unsubscribes.push(unsubscribe)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [user, selectedPeriod, selectedDate])

  // Filter tasks by selected period and filters
  const filteredTasks = tasks.filter((task) => {
    // Try to get a valid date from the task
    let taskDate
    if (task.date) {
      taskDate = new Date(task.date)

      // If task.date is invalid, fall back to createdAt
      if (isNaN(taskDate.getTime())) {
        if (task.createdAt && typeof task.createdAt.toDate === 'function') {
          taskDate = task.createdAt.toDate()
        } else if (task.createdAt) {
          taskDate = new Date(task.createdAt)
        }
      }
    } else if (task.createdAt && typeof task.createdAt.toDate === 'function') {
      taskDate = task.createdAt.toDate()
    } else if (task.createdAt) {
      taskDate = new Date(task.createdAt)
    } else {
      return false
    }

    // Check if taskDate is valid
    const isValidDate = !isNaN(taskDate.getTime())
    if (!isValidDate) {
      return false // Skip tasks with invalid dates
    }

    const { start, end } = getPeriodDates()

    const inPeriod = taskDate >= start && taskDate <= end
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesLabel = labelFilter === 'all' || (task.labels && task.labels.includes(labelFilter))

    return inPeriod && matchesPriority && matchesLabel
  })

  // Get all available labels from tasks
  const allLabels = [...new Set(tasks.flatMap((task) => task.labels || []))]

  // Format helper function for time display
  const formatTotalTime = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m`
    return `0m`
  }

  // Derived metrics for KPI cards
  const kpis = useMemo(() => {
    const completed = filteredTasks.filter((t) => t.completed).length
    const total = filteredTasks.length
    const active = filteredTasks.filter((t) => !t.completed).length

    // Sum work time from work sessions for the selected period
    const totalFocusSec = workSessions.reduce((acc, session) => {
      const duration =
        typeof session.durationSec === 'number' ? Math.max(0, session.durationSec) : 0
      return acc + duration
    }, 0)

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      completed,
      total,
      active,
      progress,
      totalFocusLabel: formatTotalTime(totalFocusSec),
    }
  }, [filteredTasks, workSessions])

  const handleTaskSelect = (task) => {
    setSelectedTask(task)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedTask(null)
  }

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-soft min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Please log in to view insights</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header - brand match with Tasks */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 font-display bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
              Insights & Analytics
            </h1>
            <p className="text-xl text-slate-600 font-body leading-relaxed">
              Understand your productivity trends and performance over time
            </p>
          </div>
        </div>
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Completed */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900 font-display">
                  {kpis.completed}/{kpis.total}
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-1">Tasks Completed</div>
                <div className="text-xs text-emerald-700 font-medium">
                  {kpis.progress}% success rate
                </div>
              </div>
            </div>
          </div>

          {/* Focus Time */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock3 size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900 font-display">
                  {kpis.totalFocusLabel}
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-1">Focus Time (period)</div>
                <div className="text-xs text-blue-700 font-medium">Productivity tracking</div>
              </div>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 border border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900 font-display">{kpis.active}</div>
                <div className="text-sm font-semibold text-slate-700 mb-1">Active Tasks</div>
                <div className="text-xs text-amber-700 font-medium">In progress</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900 font-display">
                  {kpis.progress}%
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-1">Completion Rate</div>
                <div className="text-xs text-purple-700 font-medium">Success metric</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
        <InsightsFilters
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          labelFilter={labelFilter}
          onLabelChange={setLabelFilter}
          allLabels={allLabels}
          periodDates={getPeriodDates()}
        />
      </div>

      {/* Work Hours Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
        <WorkHoursChart
          tasks={filteredTasks}
          workSessions={workSessions}
          periodDates={getPeriodDates()}
        />
      </div>

      {/* Task History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
        <TaskHistory
          tasks={filteredTasks}
          workSessions={workSessions}
          onTaskSelect={handleTaskSelect}
          periodDates={getPeriodDates()}
        />
      </div>

      {/* Task Details Drawer */}
      {selectedTask && (
        <TaskDetailsDrawer task={selectedTask} isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
      )}
    </div>
  )
}
