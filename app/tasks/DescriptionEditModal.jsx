'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Button from '@/components/Button'
import { X, Edit3 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
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

// CSS will be imported dynamically in useEffect

export default function DescriptionEditModal({ isOpen, onClose, description, onSave }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Dynamically import Quill CSS when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent(description || '')
      import('react-quill-new/dist/quill.snow.css')
    }
  }, [isOpen, description])

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
    'color',
    'background',
    'link',
    'blockquote',
    'code-block',
  ]

  const handleClose = () => {
    if (!isLoading) {
      setContent(description)
      onClose()
    }
  }

  const handleSave = async () => {
    if (content === description) {
      onClose()
      return
    }

    setIsLoading(true)
    try {
      await onSave(content)
      onClose()
    } catch (error) {
      console.error('Failed to save description:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const modalHeader = {
    icon: <Edit3 size={24} className="text-blue-600" />,
    iconBgColor: 'bg-blue-100',
    title: 'Edit Task Description',
    subtitle: 'Update your task description with rich text formatting',
  }

  const modalContent = (
    <div className="mb-6">
      <label className="block text-base font-semibold text-slate-900 mb-2">Task Description</label>
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
  )

  const modalFooter = (
    <>
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
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      header={modalHeader}
      content={modalContent}
      footer={modalFooter}
      size="default"
    />
  )
}
