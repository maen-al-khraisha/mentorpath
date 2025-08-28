'use client'

import { useState, useEffect } from 'react'
import { createTask } from '@/lib/tasksApi'
import { deleteNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
import Modal from '@/components/ui/Modal'
import {
  X,
  Calendar,
  Clock,
  Target,
  Tag,
  CheckSquare,
  FileText,
  Paperclip,
  Plus,
} from 'lucide-react'
import LabelBadge from '@/components/LabelBadge'
import { useToast } from '@/components/Toast'
import dynamic from 'next/dynamic'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  ),
  onError: (error) => {
    console.error('Failed to load React-Quill:', error)
    return (
      <div className="h-32 bg-red-50 border border-red-200 rounded flex items-center justify-center">
        <span className="text-red-600">Editor failed to load. Please refresh the page.</span>
      </div>
    )
  },
})

export default function ConvertToTaskModal({ isOpen, note, onClose, onConvert }) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [title, setTitle] = useState(note?.title || '')
  const [description, setDescription] = useState(note?.description || '')
  const [date, setDate] = useState(new Date())
  const [priority, setPriority] = useState('Medium')
  const [labels, setLabels] = useState(note?.labels || [])
  const [labelInput, setLabelInput] = useState('')
  const [checklist, setChecklist] = useState([])
  const [checkInput, setCheckInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(new Set())

  if (!isOpen || !note) return null

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (isOpen) {
      import('react-quill/dist/quill.snow.css')
    }
  }, [isOpen])

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

    if (!title.trim()) {
      showToast('Please enter a task title', 'error')
      return
    }

    try {
      setBusy(true)

      // Create the task first without attachments
      const taskId = await createTask({
        title: title.trim(),
        description: description.trim(),
        date: date,
        priority: priority,
        labels: labels,
        checklist: checklist,
        userId: user.uid,
      })

      // Delete the original note
      await deleteNote(note.id)

      showToast('Note successfully converted to task!', 'success')
      onConvert?.(taskId)
      onClose?.()
    } catch (error) {
      console.error('Failed to convert note to task:', error)
      showToast('Failed to convert note to task: ' + error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  function addLabel() {
    const v = labelInput.trim()
    if (!v) return
    if (labels.includes(v)) return // Prevent duplicates
    setLabels((ls) => [...ls, v])
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

  const header = {
    icon: <Target size={24} className="text-green-600" />,
    title: 'Convert Note to Task',
    subtitle: 'Transform your note into a actionable task',
    iconBgColor: 'bg-green-100',
  }

  const content = (
    <div className="space-y-6">
      {/* Task Details Form */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-slate-900 font-display flex items-center gap-3">
          <Target size={20} className="text-green-600" />
          Task Details
        </h4>

        {/* Task Title */}
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Task Title</label>
          <input
            className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
          />
        </div>

        {/* Task Description - Full Width */}
        <div>
          <label className="block text-base font-semibold text-slate-900 mb-1">Description</label>
          <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
            <ReactQuill
              value={description}
              onChange={setDescription}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Enter task description..."
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
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 ${getPriorityColors(
                      p,
                      priority === p
                    )}`}
                  >
                    <span className="text-lg">{getPriorityIcon(p)}</span>
                    {p}
                  </button>
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
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
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
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
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
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <CheckSquare
                      size={18}
                      className={`cursor-pointer transition-colors ${
                        item.done ? 'text-green-600' : 'text-slate-400'
                      }`}
                      onClick={() =>
                        setChecklist((ls) =>
                          ls.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i))
                        )
                      }
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.done ? 'line-through text-slate-500' : 'text-slate-700'
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => setChecklist((ls) => ls.filter((i) => i.id !== item.id))}
                      className="w-6 h-6 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <X size={12} className="text-red-600" />
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
                  htmlFor="attachment-input"
                  className={`cursor-pointer block ${
                    selectedFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Paperclip size={32} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">
                    {selectedFiles.length >= 3
                      ? 'Maximum files reached'
                      : 'Click to attach files or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports images, PDFs, and documents (max 3 files, 20MB each)
                  </p>
                </label>
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
                          showToast(`File "${fileItem.file.name}" removed`, 'success')
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
  )

  const footer = (
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
            Converting...
          </>
        ) : (
          <>
            <Target size={18} className="mr-2" />
            Convert to Task
          </>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      content={content}
      footer={footer}
      size="large"
      showCloseButton={true}
      closeOnBackdropClick={true}
    />
  )
}
