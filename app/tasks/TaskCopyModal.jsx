'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createTask } from '@/lib/tasksApi'
import { useAuth } from '@/lib/useAuth'
import { useToast } from '@/components/Toast'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import Modal from '@/components/ui/Modal'

import { Paperclip, Target, Plus, List, TargetIcon, X } from 'lucide-react'
import LabelBadge from '@/components/LabelBadge'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  ),
})

export default function TaskCopyModal({ open, onClose, task, onCopy, defaultDate }) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => {
    if (defaultDate && !isNaN(new Date(defaultDate).getTime())) {
      return new Date(defaultDate)
    }
    return new Date()
  })
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

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (open && task) {
      setTitle(task.title ? `${task.title} (Copy)` : '')

      // Handle date conversion properly
      let initialDate
      if (task.date) {
        console.log('Task date value:', task.date)
        console.log('Task date type:', typeof task.date)
        console.log('Task date constructor:', task.date.constructor?.name)

        try {
          // Handle different date formats (Firestore timestamp, Date object, string, etc.)
          if (task.date.toDate && typeof task.date.toDate === 'function') {
            // Firestore timestamp
            initialDate = task.date.toDate()
            console.log('Converted from Firestore timestamp:', initialDate)
          } else if (task.date instanceof Date) {
            // Already a Date object
            initialDate = task.date
            console.log('Already a Date object:', initialDate)
          } else {
            // Try to create a Date from the value
            initialDate = new Date(task.date)
            console.log('Created new Date from value:', initialDate)
          }

          // Validate the date
          if (isNaN(initialDate.getTime())) {
            console.log('Invalid date, using default')
            initialDate = defaultDate || new Date()
          } else {
            console.log('Valid date set:', initialDate)
          }
        } catch (error) {
          console.error('Error processing task date:', error)
          initialDate = defaultDate || new Date()
        }
      } else {
        console.log('No task date, using default')
        initialDate = defaultDate || new Date()
      }

      // Ensure we always set a valid date
      if (initialDate && !isNaN(initialDate.getTime())) {
        setDate(initialDate)
        console.log('Setting valid date:', initialDate)
      } else {
        const fallbackDate = new Date()
        setDate(fallbackDate)
        console.log('Setting fallback date:', fallbackDate)
      }

      setDescription(task.description || '')
      setPriority(task.priority || 'Medium')
      setLabels([...(task.labels || [])])
      setChecklist([...(task.checklist || [])])
      // Load original task attachments
      if (task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0) {
        console.log('Loading original task attachments:', task.attachments)
        // Convert original attachments to the format expected by the component
        const originalAttachments = task.attachments.map((attachment, index) => ({
          id: `original-${index}`,
          file: {
            name: attachment.name || attachment.filename || 'Unknown file',
            size: attachment.size || 0,
            type: attachment.type || attachment.mimeType || 'application/octet-stream',
            url: attachment.url || attachment.downloadURL || '',
          },
          isOriginal: true, // Flag to identify original attachments
          originalData: attachment, // Keep original data for reference
        }))
        setSelectedFiles(originalAttachments)
        console.log('Converted attachments:', originalAttachments)
      } else {
        setSelectedFiles([])
      }
    }
  }, [open, task, defaultDate])

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (open) {
      import('react-quill/dist/quill.snow.css')
    }
  }, [open])

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
      showToast('Please wait for authentication to complete', 'error')
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
        attachments: [], // Start with empty attachments, we'll copy them separately
      })

      // If we have files to upload, handle them separately with proper error handling
      if (selectedFiles.length > 0) {
        try {
          // Import the addAttachment function dynamically to avoid circular imports
          const { addAttachment } = await import('@/lib/tasksApi')

          // Handle each file based on whether it's original or new
          for (const fileItem of selectedFiles) {
            try {
              if (fileItem.isOriginal) {
                // For original attachments, we need to copy them properly
                console.log('Copying original attachment:', fileItem.file.name)

                try {
                  // Since there's no copyAttachment function, we need to download and re-upload
                  // This is the most reliable way to copy attachments
                  if (fileItem.originalData && fileItem.originalData.url) {
                    console.log(
                      'Downloading original attachment for copying:',
                      fileItem.originalData.url
                    )

                    // Download the file from the original URL
                    const response = await fetch(fileItem.originalData.url)
                    if (!response.ok) {
                      throw new Error(`Failed to download file: ${response.statusText}`)
                    }

                    // Convert the response to a blob
                    const blob = await response.blob()

                    // Create a new File object from the blob
                    const file = new File(
                      [blob],
                      fileItem.originalData.name || fileItem.originalData.filename || 'copied-file',
                      {
                        type:
                          fileItem.originalData.type ||
                          fileItem.originalData.mimeType ||
                          'application/octet-stream',
                      }
                    )

                    // Upload the copied file to the new task
                    console.log('Uploading copied attachment:', file.name)
                    await addAttachment(id, file)

                    showToast(`Successfully copied attachment "${file.name}"`, 'success')
                  } else {
                    console.warn(
                      'Original attachment missing URL, skipping:',
                      fileItem.originalData
                    )
                    showToast(
                      `Warning: Could not copy attachment "${fileItem.file.name}" - missing file data`,
                      'warning'
                    )
                  }
                } catch (copyError) {
                  console.error('Failed to copy original attachment:', copyError)
                  showToast(
                    `Warning: Could not copy original attachment "${fileItem.file.name}"`,
                    'warning'
                  )
                }
              } else {
                // For new files, upload them
                console.log('Uploading new attachment:', fileItem.file.name)
                await addAttachment(id, fileItem.file)
              }
            } catch (uploadError) {
              // Use our professional error handling function
              showToast(`Failed to process attachment "${fileItem.file.name}"`, 'error')
              console.error('Attachment processing failed:', uploadError)
              continue // Continue with other files
            }
          }
        } catch (attachmentError) {
          console.error('Attachment handling failed:', attachmentError)
          // Don't fail the entire task creation, just log the error
        }
      }

      // Task created successfully
      showToast(`Task "${title}" copied successfully!`, 'success')
      onCopy?.(id) // Call onCopy with the new task ID
      onClose?.() // Close the modal
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
      showToast('You can only upload up to 3 files', 'error')
      return
    }

    // Check file size (20MB limit) - 20971520 bytes exactly as specified
    const maxSize = 20971520 // 20 MB in bytes
    if (file.size > maxSize) {
      showToast('The file is too large. Please upload a file smaller than 20 MB.', 'error')
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
        showToast(`File "${fileName}" is too large. Please select a smaller file.`, 'error')
      } else {
        showToast('One or more files are too large. Please select smaller files.', 'error')
      }
      return
    }

    // Handle other common errors
    if (error.message && error.message.includes('User must be authenticated')) {
      showToast('Please wait for authentication to complete', 'error')
      return
    }

    if ((error.message && error.message.includes('network')) || error.message.includes('fetch')) {
      showToast('Network error. Please check your connection and try again.', 'error')
      return
    }

    // Generic error message
    if (fileName) {
      showToast(`Failed to upload "${fileName}". Please try again.`, 'error')
    } else {
      showToast('An error occurred. Please try again.', 'error')
    }
  }

  if (!open) return null

  const modalHeader = {
    icon: (
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
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
    iconBgColor: 'bg-blue-100',
    title: 'Copy Task',
    subtitle: `Create a copy of "${task?.title}" with your modifications`,
  }

  const modalContent = (
    <div className="space-y-6">
      {/* Task Details Form */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-slate-900 font-display flex items-center gap-3">
          <TargetIcon size={20} className="text-blue-600" />
          Task Details
        </h4>

        {/* Task Title */}
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Task Title</label>
          <input
            className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
          />
        </div>

        {/* Task Description - Full Width */}
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">
            Task Description
          </label>
          <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
            <ReactQuill
              value={description}
              onChange={setDescription}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Describe your task..."
              className="min-h-[200px]"
            />
          </div>
        </div>

        {/* Date and Priority - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-1">Task Date</label>
            <CustomDatePicker
              value={date}
              onChange={(selectedDate) => setDate(selectedDate)}
              name="taskDate"
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-slate-900 mb-1">
              Priority Level
            </label>
            <div className="flex items-center gap-3">
              {['High', 'Medium', 'Low'].map((p) => {
                const getPriorityColors = (priority, isSelected) => {
                  switch (priority) {
                    case 'High':
                      return isSelected
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                        : 'border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                    case 'Medium':
                      return isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-amber-200 bg-white text-amber-600 hover:border-amber-300 hover:bg-amber-50'
                    case 'Low':
                      return isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-emerald-200 bg-white text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'
                    default:
                      return isSelected
                        ? 'border-slate-500 bg-slate-50 text-slate-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }
                }

                const getPriorityIcon = (priority) => {
                  switch (priority) {
                    case 'High':
                      return '🔥'
                    case 'Medium':
                      return '⚡'
                    case 'Low':
                      return '🌱'
                    default:
                      return '📋'
                  }
                }

                return (
                  <label
                    key={p}
                    className={`px-4 h-[42px] flex items-center rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium ${getPriorityColors(p, priority === p)}`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      className="sr-only"
                      onChange={() => setPriority(p)}
                      checked={priority === p}
                    />
                    {getPriorityIcon(p)} {p}
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Labels and Checklist - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Labels */}
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-1">Labels</label>

            {/* Add New Label */}
            <div className="flex items-center gap-3 mb-4">
              <input
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                placeholder="Enter label name..."
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLabel()}
              />
              <Button
                variant="primary"
                size="icon"
                onClick={addLabel}
                disabled={!labelInput.trim()}
              >
                <Plus size={18} />
              </Button>
            </div>

            {/* Existing Labels */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {labels.map((label, index) => (
                  <LabelBadge
                    key={index}
                    label={label}
                    onRemove={() => setLabels((ls) => ls.filter((_, i) => i !== index))}
                    showRemoveButton={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-base font-semibold text-slate-900 mb-1">Checklist</label>

            {/* Add New Checklist Item */}
            <div className="flex items-center gap-3 mb-4">
              <input
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
                placeholder="Enter checklist item..."
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCheck()}
              />
              <Button
                variant="primary"
                size="icon"
                onClick={addCheck}
                disabled={!checkInput.trim()}
              >
                <Plus size={18} />
              </Button>
            </div>

            {/* Existing Checklist Items */}
            {checklist.length > 0 && (
              <div className="space-y-3">
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
                      aria-label="Remove checklist item"
                      className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                    >
                      <X size={14} className="text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
                {selectedFiles?.some((f) => f.isOriginal) && (
                  <span className="ml-1 text-blue-600">
                    ({selectedFiles?.filter((f) => f.isOriginal).length} original,{' '}
                    {selectedFiles?.filter((f) => !f.isOriginal).length} new)
                  </span>
                )}
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
                      showToast(`File "${file.name}" attached successfully!`, 'success')
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
                  {selectedFiles?.some((f) => f.isOriginal) && (
                    <div className="mt-2 text-blue-600">
                      Original task attachments are included and cannot be removed
                    </div>
                  )}
                  {selectedFiles?.some((f) => f.isOriginal) && (
                    <div className="mt-1 text-blue-600 text-xs">
                      Note: Original attachments will be copied to the new task
                    </div>
                  )}
                </div>
              </div>

              {/* File List */}
              {selectedFiles && selectedFiles.length > 0 ? (
                <div className="space-y-3">
                  {selectedFiles.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors duration-200 ${
                        fileItem.isOriginal
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {/* File Preview Rectangle */}
                      <div
                        className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${
                          fileItem.isOriginal ? 'bg-blue-200' : 'bg-slate-200'
                        }`}
                      >
                        {fileItem.file.type.startsWith('image/') ? (
                          fileItem.isOriginal && fileItem.file.url ? (
                            // For original attachments, use the URL if available
                            <img
                              src={fileItem.file.url}
                              alt={fileItem.file.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            // For new files, use URL.createObjectURL
                            <img
                              src={URL.createObjectURL(fileItem.file)}
                              alt={fileItem.file.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          )
                        ) : (
                          <Paperclip
                            size={20}
                            className={fileItem.isOriginal ? 'text-blue-600' : 'text-slate-600'}
                          />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-medium truncate ${
                              fileItem.isOriginal ? 'text-blue-900' : 'text-slate-900'
                            }`}
                          >
                            {fileItem.file.name}
                          </p>
                          {fileItem.isOriginal && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Original
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            fileItem.isOriginal ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        >
                          {fileItem.file.size > 1024 * 1024
                            ? `${(fileItem.file.size / (1024 * 1024)).toFixed(1)} MB`
                            : `${(fileItem.file.size / 1024).toFixed(1)} KB`}
                        </p>
                      </div>

                      {/* Remove Button - Only show for new attachments */}
                      {!fileItem.isOriginal && (
                        <button
                          onClick={() => {
                            removeFile(fileItem.id)
                            showToast(`File "${fileItem.file.name}" removed`, 'success')
                          }}
                          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                          title="Remove attachment"
                          aria-label={`Remove ${fileItem.file.name}`}
                        >
                          <X size={14} className="text-red-600" />
                        </button>
                      )}
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
  )

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} className="px-6 py-3 rounded-xl font-medium">
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={onSave}
        disabled={busy || !title.trim()}
        className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {busy ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Copying Task...
          </>
        ) : (
          <>
            <Target size={18} className="mr-2" />
            Copy Task
          </>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      header={modalHeader}
      content={modalContent}
      footer={modalFooter}
      size="large"
    />
  )
}
