'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createTask } from '@/lib/tasksApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'

import { Paperclip, X } from 'lucide-react'
import toast from 'react-hot-toast'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  ),
})

export default function TaskAddModal({ open, onClose, defaultDate }) {
  const { user, loading } = useAuth()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate || new Date())
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [labels, setLabels] = useState([])
  const [labelInput, setLabelInput] = useState('')
  const [checklist, setChecklist] = useState([])
  const [checkInput, setCheckInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(new Set())
  const [uploadProgress, setUploadProgress] = useState({})

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (open) {
      import('react-quill/dist/quill.snow.css')
    }
  }, [open])

  if (!open) return null

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
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

  async function onSave() {
    if (!user) {
      alert('Please wait for authentication to complete')
      return
    }

    try {
      setBusy(true)

      // Create task first without attachments
      const id = await createTask({
        title,
        date,
        description,
        priority,
        labels,
        checklist,
        attachments: [], // Start with empty attachments
      })

      // If we have files to upload, handle them separately with proper error handling
      if (selectedFiles.length > 0) {
        try {
          // Import the addAttachment function dynamically to avoid circular imports
          const { addAttachment } = await import('@/lib/tasksApi')

          // Upload each file individually with proper error handling
          for (const fileItem of selectedFiles) {
            try {
              await addAttachment(id, fileItem.file)
            } catch (uploadError) {
              // Use our professional error handling function
              showUserFriendlyError(uploadError, fileItem.file.name)
              continue // Continue with other files
            }
          }
        } catch (attachmentError) {
          console.error('Attachment handling failed:', attachmentError)
          // Don't fail the entire task creation, just log the error
        }
      }

      // Task created successfully
      onClose?.(id)
      setTitle('')
      setDescription('')
      setLabels([])
      setChecklist([])
      setSelectedFiles([])
    } catch (e) {
      console.error('Task creation failed:', e)

      // Use our professional error handling function
      showUserFriendlyError(e)
    } finally {
      setBusy(false)
    }
  }

  function addLabel() {
    const v = labelInput.trim()
    if (!v) return
    setLabels((ls) => Array.from(new window.Set([...ls, v])))
    setLabelInput('')
  }

  function addCheck() {
    const v = checkInput.trim()
    if (!v) return
    setChecklist((ls) => [...ls, { id: crypto.randomUUID(), text: v, done: false }])
    setCheckInput('')
  }

  function addFile(file) {
    if (selectedFiles.length >= 3) {
      alert('You can only upload up to 3 files')
      return
    }

    // Check file size (20MB limit) - 20971520 bytes exactly as specified
    const maxSize = 20971520 // 20 MB in bytes
    if (file.size > maxSize) {
      alert('The file is too large. Please upload a file smaller than 20 MB.')
      return
    }

    const fileId = crypto.randomUUID()
    setSelectedFiles((prev) => [...prev, { id: fileId, file }])

    // Simulate upload process for images
    if (file.type.startsWith('image/')) {
      setUploadingFiles((prev) => new Set([...prev, fileId]))

      // Simulate upload delay (remove this in production and use actual upload logic)
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
      }, 2000) // 2 second delay for demo
    }
  }

  function removeFile(fileId) {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId))
    setUploadingFiles((prev) => {
      const newSet = new Set(prev)
      newSet.delete(fileId)
      return newSet
    })
  }

  // Professional error handling function
  function showUserFriendlyError(error, fileName = '') {
    console.error('Error details:', error)

    // Handle file size errors specifically
    if (
      error.message &&
      (error.message.includes('file size exceeds') ||
        error.message.includes('20971520 bytes') ||
        error.message.includes('File size too large') ||
        error.message.includes('Maximum file size') ||
        error.message.includes('invalid file parameter'))
    ) {
      if (fileName) {
        alert(`File "${fileName}" is too large. Please select a smaller file.`)
      } else {
        alert('One or more files are too large. Please select smaller files.')
      }
      return
    }

    // Handle other common errors
    if (error.message && error.message.includes('User must be authenticated')) {
      alert('Please wait for authentication to complete')
      return
    }

    if ((error.message && error.message.includes('network')) || error.message.includes('fetch')) {
      alert('Network error. Please check your connection and try again.')
      return
    }

    // Generic error message
    if (fileName) {
      alert(`Failed to upload "${fileName}". Please try again.`)
    } else {
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose?.()} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">Create New Task</h3>
              <p className="text-slate-600 font-body">Add a new task to your productivity system</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Basic Task Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 font-body">
                  Task Name
                </label>
                <input
                  className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task name..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 font-body">
                  Task Date
                </label>
                <CustomDatePicker
                  value={date}
                  onChange={(selectedDate) => setDate(selectedDate)}
                  name="taskDate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 font-body">
                  Priority Level
                </label>
                <div className="flex items-center gap-3">
                  {['High', 'Medium', 'Low'].map((p) => (
                    <label
                      key={p}
                      className={`px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium ${
                        priority === p
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        className="sr-only"
                        onChange={() => setPriority(p)}
                        checked={priority === p}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Right column content can be added here in the future if needed */}
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 font-body">
              Task Description
            </label>
            <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
              <ReactQuill
                value={description}
                onChange={setDescription}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Describe your task..."
                className="min-h-[120px]"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 font-body">
              Labels
            </label>
            <div className="flex items-center gap-3">
              <input
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Enter label name..."
                onKeyPress={(e) => e.key === 'Enter' && addLabel()}
              />
              <Button
                variant="secondary"
                size="md"
                onClick={addLabel}
                className="px-6 py-3 rounded-xl font-medium"
              >
                Add Label
              </Button>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {labels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100 text-blue-700 font-medium text-sm border border-blue-200"
                  >
                    {label}
                    <button
                      onClick={() => setLabels((ls) => ls.filter((_, i) => i !== index))}
                      className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 font-body">
              Checklist
            </label>
            <div className="flex items-center gap-3 mb-4">
              <input
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                placeholder="Add checklist item..."
                onKeyPress={(e) => e.key === 'Enter' && addCheck()}
              />
              <Button
                variant="secondary"
                size="md"
                onClick={addCheck}
                className="px-6 py-3 rounded-xl font-medium"
              >
                Add Item
              </Button>
            </div>
            {checklist.length > 0 && (
              <div className="space-y-2">
                {checklist.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <span
                      className={`flex-1 text-sm font-medium ${c.done ? 'line-through text-slate-500' : 'text-slate-700'}`}
                    >
                      {c.text}
                    </span>
                    <button
                      onClick={() => setChecklist((ls) => ls.filter((x) => x.id !== c.id))}
                      className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Paperclip size={18} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                    {selectedFiles?.length || 0}/3
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt,.doc,.docx"
                      className="hidden"
                      id="attachment-input"
                      disabled={selectedFiles.length >= 3}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          addFile(file)
                          toast.success(`File "${file.name}" attached successfully!`)
                          // Reset the input so the same file can be selected again if needed
                          e.target.value = ''
                        }
                      }}
                    />

                    <label
                      htmlFor={selectedFiles.length >= 3 ? undefined : 'attachment-input'}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                        selectedFiles.length >= 3
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                      }`}
                      aria-disabled={selectedFiles.length >= 3}
                    >
                      <Paperclip size={18} />
                      {selectedFiles.length >= 3 ? 'Max 3 attachments' : 'Choose file to attach'}
                    </label>

                    <div className="mt-3 text-sm text-slate-500">
                      Support for documents, images, and more - Max 20MB per file
                    </div>
                  </div>

                  {/* File List */}
                  {selectedFiles && selectedFiles.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFiles.map((fileItem) => (
                        <div
                          key={fileItem.id}
                          className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors duration-200"
                        >
                          {/* File Preview Rectangle */}
                          <div className="w-12 h-12 rounded-md bg-slate-200 flex items-center justify-center flex-shrink-0">
                            {fileItem.file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(fileItem.file)}
                                alt={fileItem.file.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <Paperclip size={20} className="text-slate-600" />
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {fileItem.file.size > 1024 * 1024
                                ? `${(fileItem.file.size / (1024 * 1024)).toFixed(1)} MB`
                                : `${(fileItem.file.size / 1024).toFixed(1)} KB`}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              removeFile(fileItem.id)
                              toast.success(`File "${fileItem.file.name}" removed`)
                            }}
                            className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                            title="Remove attachment"
                            aria-label={`Remove ${fileItem.file.name}`}
                          >
                            <X size={14} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="text-center py-8 text-slate-500">
                      <Paperclip size={32} className="mx-auto mb-3 text-slate-400" />
                      <p className="text-sm font-medium">No attachments yet</p>
                      <p className="text-xs text-slate-400">Add files to support your task</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => onClose?.()}
            className="px-6  rounded-xl font-medium"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!user || loading || busy || !title.trim()}
            className="px-8  rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </>
            ) : busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Task...
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Task
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
