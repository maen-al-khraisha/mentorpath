'use client'

import { useState, useEffect } from 'react'
import { createTask } from '@/lib/tasksApi'
import { deleteNote } from '@/lib/notesApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import CustomDatePicker from '@/components/CustomDatePicker'
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
const ReactQuill = dynamic(() => import('react-quill').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
      <span className="text-slate-500 font-body">Loading editor...</span>
    </div>
  ),
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
              await addAttachment(taskId, fileItem.file)
            } catch (uploadError) {
              console.error(`Failed to upload ${fileItem.file.name}:`, uploadError)
              showToast(`Failed to upload ${fileItem.file.name}`, 'error')
              continue // Continue with other files
            }
          }
        } catch (attachmentError) {
          console.error('Attachment handling failed:', attachmentError)
          showToast('Some attachments failed to upload', 'error')
          // Don't fail the entire task creation, just log the error
        }
      }

      // Delete the original note
      await deleteNote(note.id)

      // Close modal and notify parent
      onClose?.()
      onConvert?.(note.id, taskId)
      showToast('Note converted to task!', 'success')
    } catch (e) {
      console.error(e)
      showToast('Failed to convert note to task: ' + e.message, 'error')
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

  function removeLabel(labelToRemove) {
    setLabels((ls) => ls.filter((l) => l !== labelToRemove))
  }

  function addCheck() {
    const v = checkInput.trim()
    if (!v) return
    setChecklist((ls) => [...ls, { id: crypto.randomUUID(), text: v, done: false }])
    setCheckInput('')
  }

  function removeCheck(checkId) {
    setChecklist((ls) => ls.filter((c) => c.id !== checkId))
  }

  function handleKeyPress(e, type) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'label') addLabel()
      if (type === 'check') addCheck()
    }
  }

  function addFile(file) {
    if (selectedFiles.length >= 3) {
      showToast('You can only upload up to 3 files', 'error')
      return
    }

    // Check file size (20MB limit)
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose?.()} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-green-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">
                Convert Note to Task
              </h3>
              <p className="text-slate-600 font-body">
                Transform your note into an actionable task
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Task Details Form */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-slate-900 font-display flex items-center gap-3">
              <Target size={20} className="text-green-600" />
              Task Details
            </h4>

            {/* Task Title */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-1">
                Task Title
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
              />
            </div>

            {/* Task Description - Full Width */}
            <div>
              <label className="block text-base font-semibold text-slate-900 mb-1">
                Description
              </label>
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
                <label className="block text-base font-semibold text-slate-900 mb-1">
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
                    className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                    placeholder="Enter label name..."
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'label')}
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
                    {labels.map((label) => (
                      <LabelBadge
                        key={label}
                        label={label}
                        onRemove={removeLabel}
                        showRemoveButton={true}
                        variant="green"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-base font-semibold text-slate-900 mb-1">
                  Checklist
                </label>

                {/* Add New Checklist Item */}
                <div className="flex items-center gap-3 mb-4">
                  <input
                    className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-body focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 placeholder-slate-400"
                    placeholder="Enter checklist item..."
                    value={checkInput}
                    onChange={(e) => setCheckInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'check')}
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
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <span className="flex-1 text-sm font-medium text-slate-700">
                          {item.text}
                        </span>
                        <button
                          onClick={() => removeCheck(item.id)}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                          aria-label="Remove checklist item"
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

        {/* Action Buttons */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => onClose?.()}
            disabled={busy}
            className="px-6 py-3 rounded-xl font-medium"
          >
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
        </div>
      </div>
    </div>
  )
}
