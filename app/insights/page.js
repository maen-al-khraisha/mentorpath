'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToTasks } from '@/lib/tasksApi'
import InsightsFilters from './InsightsFilters'
import StatsCards from './StatsCards'
import WorkHoursChart from './WorkHoursChart'
import TaskHistory from './TaskHistory'
import TaskDetailsDrawer from './TaskDetailsDrawer'

export default function InsightsPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [labelFilter, setLabelFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Set up real-time subscription to tasks
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks(user.uid, (tasksData) => {
      setTasks(tasksData)
    })

    return () => unsubscribe()
  }, [user])

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

  // Filter tasks by selected period and filters
  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date || task.createdAt?.toDate())
    const { start, end } = getPeriodDates()

    const inPeriod = taskDate >= start && taskDate <= end
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesLabel = labelFilter === 'all' || (task.labels && task.labels.includes(labelFilter))

    return inPeriod && matchesPriority && matchesLabel
  })

  // Get all available labels from tasks
  const allLabels = [...new Set(tasks.flatMap((task) => task.labels || []))]

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900">Insights & Analytics</h1>
      </div>

      {/* Filters & Navigation */}
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

      {/* Stats Cards */}
      <StatsCards tasks={filteredTasks} periodDates={getPeriodDates()} />

      {/* Work Hours Chart */}
      <WorkHoursChart tasks={filteredTasks} periodDates={getPeriodDates()} />

      {/* Task History */}
      <TaskHistory
        tasks={filteredTasks}
        onTaskSelect={handleTaskSelect}
        periodDates={getPeriodDates()}
      />

      {/* Task Details Drawer */}
      {selectedTask && (
        <TaskDetailsDrawer task={selectedTask} isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
      )}
    </div>
  )
}
