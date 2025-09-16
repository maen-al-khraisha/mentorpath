'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/Button'
import { Crown, AlertTriangle } from 'lucide-react'

export default function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  limitType,
  limitCount,
  limitPeriod = 'month',
}) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      await onUpgrade()
    } finally {
      setIsUpgrading(false)
    }
  }

  const getLimitText = () => {
    switch (limitType) {
      case 'notes':
        return `${limitCount} notes per ${limitPeriod}`
      case 'tasks':
        return `${limitCount} tasks per ${limitPeriod}`
      case 'habits':
        return `${limitCount} habits per ${limitPeriod}`
      case 'sheets':
        return `${limitCount} agenda sheet${limitCount > 1 ? 's' : ''} ${limitPeriod === 'total' ? 'total' : `per ${limitPeriod}`}`
      case 'events':
        return `${limitCount} event${limitCount > 1 ? 's' : ''} per ${limitPeriod === 'month' ? 'day' : limitPeriod}`
      default:
        return `${limitCount} items per ${limitPeriod}`
    }
  }

  const getFeatureText = () => {
    switch (limitType) {
      case 'notes':
        return 'unlimited notes'
      case 'tasks':
        return 'unlimited tasks'
      case 'habits':
        return 'unlimited habits'
      case 'sheets':
        return 'unlimited agenda sheets'
      case 'events':
        return 'unlimited events'
      default:
        return 'unlimited access'
    }
  }

  const header = (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-orange-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">You've Reached Your Limit</h2>
      <p className="text-gray-600">You've used all {getLimitText()} available on your Free plan.</p>
    </div>
  )

  const content = (
    <div className="space-y-6">
      {/* Pro Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Crown className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Upgrade to Pro</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Get {getFeatureText()}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Advanced insights dashboard</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Priority support</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Export your data</span>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-1">$7</div>
        <div className="text-gray-600">per month</div>
        <div className="text-sm text-blue-600 font-medium mt-2">Cancel anytime • No commitment</div>
      </div>
    </div>
  )

  const footer = (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleUpgrade}
          disabled={isUpgrading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUpgrading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </div>
          )}
        </Button>

        <Button variant="outline" onClick={onClose} className="flex-1" disabled={isUpgrading}>
          Maybe Later
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your current usage will be preserved. Upgrade anytime to unlock unlimited access.
        </p>
      </div>
    </div>
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
