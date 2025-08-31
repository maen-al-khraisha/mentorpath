'use client'

import { useState, useEffect } from 'react'
import { createEvent } from '@/lib/eventsApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import { Calendar, Clock, Link, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'
import Modal from '@/components/ui/Modal'

// Dynamically import React-Quill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
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

// Import ReactQuill CSS
import 'react-quill-new/dist/quill.snow.css'

// Custom styles for ReactQuill
const quillStyles = `
  .ql-toolbar.ql-snow {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 0.75rem 0.75rem 0 0;
    background: #f8fafc;
    padding: 12px;
  }
  
  .ql-container.ql-snow {
    border: none;
    border-radius: 0 0 0.75rem 0.75rem;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .ql-editor {
    min-height: 150px;
    padding: 16px;
    font-family: inherit;
  }
  
  .ql-editor.ql-blank::before {
    color: #94a3b8;
    font-style: normal;
    font-family: inherit;
  }
  
  .ql-toolbar button {
    border-radius: 6px;
    margin: 2px;
  }
  
  .ql-toolbar button:hover {
    background-color: #e2e8f0;
  }
  
  .ql-toolbar button.ql-active {
    background-color: #3b82f6;
    color: white;
  }
`

export default function AddEventModal({ isOpen, onClose, onEventCreated, selectedDate }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(() => {
    // Create a timezone-safe date string for today
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayString = `${year}-${month}-${day}`

    return {
      name: '',
      description: '',
      link: '',
      date: todayString,
      time: '12:00',
    }
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
    'color',
    'background',
    'link',
    'blockquote',
    'code-block',
  ]

  // Set selected date when modal opens
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }))
    }
  }, [selectedDate])

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
    // Create a timezone-safe date string for today
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayString = `${year}-${month}-${day}`

    setFormData({
      name: '',
      description: '',
      link: '',
      date: todayString,
      time: '12:00',
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const modalHeader = {
    icon: <Calendar size={24} className="text-blue-600" />,
    iconBgColor: 'bg-blue-100',
    title: 'Create New Event',
    subtitle: 'Schedule a new event in your calendar',
  }

  const modalContent = (
    <>
      <style jsx global>
        {quillStyles}
      </style>
      <div className="space-y-6">
        {/* Event Name - Full Width */}
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Event Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
            placeholder="Enter event name..."
            required
          />
        </div>

        {/* Date and Time - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-1">Event Date</label>
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
            <label className="block text-base font-semibold text-slate-900 mb-1">Event Time</label>
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
              className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 bg-white text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
              placeholder="https://meet.google.com/..."
            />
          </div>
        </div>

        {/* Event Description - Full Width */}
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">
            Event Description
          </label>
          <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white">
            <ReactQuill
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Describe your event..."
              className="min-h-[200px] max-h-[250px]"
              theme="snow"
              style={{ height: 'auto' }}
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
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
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
    </>
  )

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        onClick={handleClose}
        className="px-6 py-3 rounded-xl font-medium"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting || !formData.name.trim()}
        className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating Event...
          </>
        ) : (
          <>
            <Calendar size={18} className="mr-2" />
            Create Event
          </>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      header={modalHeader}
      content={modalContent}
      footer={modalFooter}
      size="large"
    />
  )
}
