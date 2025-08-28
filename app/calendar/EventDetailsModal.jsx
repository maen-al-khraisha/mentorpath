'use client'

import { useState, useEffect } from 'react'
import { updateEvent, deleteEvent } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import CustomDatePicker from '@/components/CustomDatePicker'
import {
  X,
  Edit,
  Save,
  RotateCcw,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  FileText,
  Link,
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-32 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center">
      <div className="text-slate-500">Loading editor...</div>
    </div>
  ),
  onError: (error) => {
    console.error('Failed to load React-Quill:', error)
    return (
      <div className="w-full h-32 bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center">
        <div className="text-red-600">Editor failed to load. Please refresh the page.</div>
      </div>
    )
  },
})

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEventUpdated,
  onEventDeleted,
  onViewEvent,
  openInEditMode = false,
}) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    link: event?.link || '',
    date: event?.date || '',
    time: event?.time || '',
  })

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
    'blockquote',
    'code-block',
  ]

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        link: event.link || '',
        date: event.date || '',
        time: event.time || '',
      })
    }
  }, [event])

  // Auto-open in edit mode if specified
  useEffect(() => {
    if (isOpen && openInEditMode) {
      setIsEditing(true)
    } else if (!isOpen) {
      setIsEditing(false)
    }
  }, [isOpen, openInEditMode])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await updateEvent(event.id, formData)
      onEventUpdated()
      setIsEditing(false)
      showToast('Event updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update event:', error)
      showToast('Failed to update event: ' + error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteEvent(event.id)
      onEventDeleted()
      onClose()
      showToast('Event deleted successfully!', 'success')
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
      name: event.name || '',
      description: event.description || '',
      link: event.link || '',
      date: event.date || '',
      time: event.time || '',
    })
  }

  const handleClose = () => {
    // If editing, cancel edit mode first
    if (isEditing) {
      handleCancel()
    } else {
      // If viewing, close the modal (return to DayEventsModal)
      onClose()
    }
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  {isEditing ? 'Edit Event' : 'Event Details'}
                </h3>
                <p className="text-slate-600 font-body">
                  {isEditing ? 'Modify your event information' : 'View and manage event details'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-200 transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={20} className="text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {isEditing ? (
            /* Edit Form */
            <div className="space-y-6">
              {/* Event Name - Full Width */}
              <div>
                <label className="block text-base font-semibold text-slate-900 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              {/* Date and Time - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Event Date
                  </label>
                  <CustomDatePicker
                    value={formData.date}
                    onChange={(date) => {
                      // Create a timezone-safe date string (YYYY-MM-DD)
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      const dateString = `${year}-${month}-${day}`
                      setFormData({ ...formData, date: dateString })
                    }}
                    name="eventDate"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-1">
                    Event Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Event Link - Full Width */}
              <div>
                <label className="block text-base font-semibold text-slate-900 mb-1">
                  Event Link (Optional)
                </label>
                <div className="relative">
                  <Link
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 bg-white text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              {/* Event Description - Full Width */}
              <div>
                <label className="block text-base font-semibold text-slate-900 mb-1">
                  Event Description
                </label>
                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Describe your event..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              {/* Event Preview */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Event Preview</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {formData.name || 'Event name will appear here'}
                      </div>
                      <div className="text-xs text-slate-600">
                        {formData.date
                          ? (() => {
                              // Parse the date string safely without timezone conversion
                              const [year, month, day] = formData.date.split('-')
                              const date = new Date(
                                parseInt(year),
                                parseInt(month) - 1,
                                parseInt(day)
                              )
                              return date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            })()
                          : 'Date will appear here'}{' '}
                        at {formData.time}
                      </div>
                    </div>
                  </div>
                  {formData.description && (
                    <div className="text-xs text-slate-600 ml-6">
                      <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                    </div>
                  )}
                  {formData.link && (
                    <div className="text-xs text-blue-600 ml-6 truncate">🔗 {formData.link}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Event Header */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar size={18} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Event Information</span>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 font-display mb-2">
                  {event.name}
                </h4>
                <p className="text-lg text-slate-600 font-body">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {event.time}
                </p>
              </div>

              {/* Event Link - Full Width */}
              {event.link && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Link size={18} className="text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Event Link</span>
                  </div>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium break-all text-lg"
                  >
                    <ExternalLink size={18} />
                    {event.link}
                  </a>
                </div>
              )}

              {/* Event Description - Full Width */}
              {event.description && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText size={18} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Description</span>
                  </div>
                  <div
                    className="text-slate-700 font-body leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Bottom */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-4">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSubmitting || !formData.name.trim()}
                className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Calendar size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="px-6 py-3 rounded-xl font-medium"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleEdit}
                  className="px-6 py-3 rounded-xl font-medium"
                >
                  <Edit size={18} className="mr-2" />
                  Edit Event
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="px-6 py-3 rounded-xl font-medium"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete Event
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        itemName={event?.name}
        confirmText="Delete Event"
      />
    </div>
  )
}
