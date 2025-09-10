'use client'

import { useState, useEffect } from 'react'
import { useLayout } from '@/lib/LayoutContext'
import { X, Eye, Play } from 'lucide-react'

export default function LayoutPreview() {
  const { currentLayout, availableLayouts, switchLayout } = useLayout()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewLayout, setPreviewLayout] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const openPreview = (layoutName) => {
    setPreviewLayout(layoutName)
    setPreviewUrl(`/dashboard?preview=${layoutName}`)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewLayout(null)
    setPreviewUrl('')
  }

  const applyLayout = () => {
    if (previewLayout && previewLayout !== currentLayout) {
      switchLayout(previewLayout)
    }
    closePreview()
  }

  // Close preview on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isPreviewOpen) {
        closePreview()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isPreviewOpen])

  return (
    <>
      {/* Preview Trigger */}
      <div className="layout-preview-trigger">
        <button
          onClick={() => openPreview('retro')}
          className="retro-button retro-button-small"
          title="Preview Retro Layout"
        >
          <Eye size={14} />
          <span>Preview Retro</span>
        </button>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="layout-preview active">
          <div className="layout-preview-header">
            <h3 className="layout-preview-title">
              Preview: {previewLayout === 'retro' ? 'Retro Layout' : 'Modern Layout'}
            </h3>
            <div className="layout-preview-actions">
              <button
                onClick={applyLayout}
                className="retro-button retro-button-primary"
                disabled={previewLayout === currentLayout}
              >
                <Play size={14} />
                <span>Apply Layout</span>
              </button>
              <button onClick={closePreview} className="layout-preview-close">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="layout-preview-content">
            <iframe
              src={previewUrl}
              className="layout-preview-iframe"
              title={`Preview of ${previewLayout} layout`}
            />
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isPreviewOpen && (
        <div className="retro-modal-backdrop" onClick={closePreview} style={{ zIndex: 999 }} />
      )}
    </>
  )
}
