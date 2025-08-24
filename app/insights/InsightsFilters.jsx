'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react'
import { format, subDays, subMonths, addDays, addMonths } from 'date-fns'
import Button from '@/components/Button'

export default function InsightsFilters({
  selectedPeriod,
  onPeriodChange,
  selectedDate,
  onDateChange,
  priorityFilter,
  onPriorityChange,
  labelFilter,
  onLabelChange,
  allLabels,
  periodDates,
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const navigatePeriod = (direction) => {
    const newDate = new Date(selectedDate)

    if (selectedPeriod === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
    } else {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
    }

    onDateChange(newDate)
  }

  const formatPeriodDisplay = () => {
    const { start, end } = periodDates

    if (selectedPeriod === 'week') {
      // For weeks, show "Sun, Aug 18 - Sat, Aug 24"
      return `${format(start, 'EEE, MMM d')} - ${format(end, 'EEE, MMM d')}`
    } else {
      // For months, show "Aug 1 - Aug 31, 2024" (include year for clarity)
      const startYear = start.getFullYear()
      const endYear = end.getFullYear()
      if (startYear === endYear) {
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
      } else {
        return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
      }
    }
  }

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  return (
    <div className="bg-[var(--bg-card)] border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Single Row Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        {/* Period Toggle & Navigation */}
        <div className="flex items-center gap-4">
          {/* Period Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={selectedPeriod === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange('week')}
              className="px-3 py-2 text-sm font-medium"
            >
              Week
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange('month')}
              className="px-3 py-2 text-sm font-medium"
            >
              Month
            </Button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigatePeriod('prev')}
              aria-label="Previous period"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigatePeriod('next')}
              aria-label="Next period"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </Button>
          </div>

          {/* Period Display */}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={16} />
            <span className="font-medium">{formatPeriodDisplay()}</span>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex-1 max-w-xs">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Label Filter */}
        <div className="flex-1 max-w-xs">
          <select
            value={labelFilter}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          >
            <option value="all">All Labels</option>
            {allLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Filters Toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="lg:hidden"
        >
          <Filter size={16} />
          <span className="text-sm font-medium">More Filters</span>
        </Button>
      </div>
    </div>
  )
}
