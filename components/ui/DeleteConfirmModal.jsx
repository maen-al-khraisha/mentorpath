'use client'

import { useState } from 'react'
import Modal from './Modal'
import Button from '@/components/Button'
import { Trash2, AlertTriangle, X } from 'lucide-react'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item?',
  itemName = '',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  size = 'default',
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete operation failed:', error)
      // Don't close modal on error, let the calling component handle it
    } finally {
      setIsDeleting(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonVariant: 'danger',
          accentColor: 'text-red-600',
        }
      case 'warning':
        return {
          iconBgColor: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonVariant: 'warning',
          accentColor: 'text-amber-600',
        }
      case 'info':
        return {
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonVariant: 'primary',
          accentColor: 'text-blue-600',
        }
      default:
        return {
          iconBgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonVariant: 'danger',
          accentColor: 'text-red-600',
        }
    }
  }

  const styles = getVariantStyles()

  const header = {
    icon: <AlertTriangle size={24} className={styles.iconColor} />,
    title,
    subtitle: 'This action cannot be undone',
    iconBgColor: styles.iconBgColor,
  }

  const content = (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
        <Trash2 size={32} className="text-red-500" />
      </div>

      <div className="space-y-2">
        <p className="text-lg text-slate-700 font-medium">{message}</p>
        {itemName && (
          <p className="text-base text-slate-600">
            <span className="font-medium">Item:</span> {itemName}
          </p>
        )}
        <p className="text-sm text-slate-500">
          This action will permanently remove the item and cannot be undone.
        </p>
      </div>
    </div>
  )

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={isDeleting}
        className="px-6 py-3 rounded-xl font-medium"
      >
        {cancelText}
      </Button>
      <Button
        variant={styles.buttonVariant}
        onClick={handleConfirm}
        disabled={isDeleting}
        className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isDeleting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Deleting...
          </>
        ) : (
          <>
            <Trash2 size={18} className="mr-2" />
            {confirmText}
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
      size={size}
      showCloseButton={true}
      closeOnBackdropClick={true}
      className="h-auto max-h-none"
    />
  )
}
