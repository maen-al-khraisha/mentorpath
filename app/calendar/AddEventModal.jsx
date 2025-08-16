'use client'

import { useState } from 'react'
import { createEvent } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import { X } from 'lucide-react'

export default function AddEventModal({ isOpen, onClose, onEventCreated, selectedDate }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '12:00',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setIsSubmitting(true)

      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        date: formData.date,
        time: formData.time,
      }

      await createEvent(eventData)
      onEventCreated()
      onClose()
      resetForm()
      showToast('Event added successfully!', 'success')
    } catch (error) {
      console.error('Failed to create event:', error)
      showToast('Failed to add event: ' + error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      link: '',
      date: selectedDate || new Date().toISOString().split('T')[0],
      time: '12:00',
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Event</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
              placeholder="Enter event name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
              placeholder="Enter event description"
            />
          </div>

          {/* Optional Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Optional</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
              placeholder="Link"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
