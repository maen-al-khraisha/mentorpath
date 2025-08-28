'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Button from '@/components/Button'
import { X } from 'lucide-react'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading editor...</span>
    </div>
  ),
})

// CSS will be imported dynamically in useEffect

export default function DescriptionEditModal({ isOpen, onClose, description, onSave }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setContent(description || '')
      // Dynamically import Quill CSS when modal opens
      import('react-quill/dist/quill.snow.css')
    }
  }, [isOpen, description])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(content)
      onClose()
    } catch (error) {
      console.error('Error saving description:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setContent(description || '')
      onClose()
    }
  }

  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  Edit Task Description
                </h3>
                <p className="text-slate-600 font-body">
                  Update your task description with rich text formatting
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} disabled={isLoading}>
              <X size={20} className="text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-base font-semibold text-slate-900 mb-2">
              Task Description
            </label>
            <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Describe your task..."
                className="min-h-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 flex-shrink-0">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
