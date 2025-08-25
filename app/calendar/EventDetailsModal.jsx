'use client'

import { useState } from 'react'
import { updateEvent, deleteEvent } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import { X, Edit, Trash2, ExternalLink } from 'lucide-react'

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEventUpdated,
  onEventDeleted,
}) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    link: event?.link || '',
    date: event?.date || '',
    time: event?.time || '',
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: event.name,
      description: event.description,
      link: event.link,
      date: event.date,
      time: event.time,
    })
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await updateEvent(event.id, formData)
      onEventUpdated()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update event:', error)
      showToast('Failed to update event: ' + error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteEvent(event.id)
      onEventDeleted()
      onClose()
    } catch (error) {
      console.error('Failed to delete event:', error)
      showToast('Failed to delete event: ' + error.message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: event.name,
      description: event.description,
      link: event.link,
      date: event.date,
      time: event.time,
    })
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Event' : 'Event Details'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {isEditing ? (
          /* Edit Form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <CustomDatePicker
                  value={formData.date}
                  onChange={(date) =>
                    setFormData({ ...formData, date: date.toISOString().split('T')[0] })
                  }
                  name="eventDate"
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

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </p>
            </div>

            {event.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}

            {event.link && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Link</h4>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  {event.link}
                </a>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button variant="secondary" onClick={handleEdit}>
                Edit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
