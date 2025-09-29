'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/Button'
import { Crown, AlertTriangle } from 'lucide-react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { firestore } from '@/lib/firebaseClient'

export default function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  limitType,
  limitCount,
  limitPeriod = 'month',
}) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [proPlan, setProPlan] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(false)

  // Fetch Pro plan data when modal opens
  useEffect(() => {
    if (isOpen && !proPlan) {
      fetchProPlan()
    }
  }, [isOpen, proPlan])

  const fetchProPlan = async () => {
    try {
      setLoadingPlan(true)
      // Try to find Pro plan - look for plans with unlimited features
      const possibleProIds = ['basic_plan', 'pro-plan', 'pro_plan', 'pro']

      for (const planId of possibleProIds) {
        try {
          const planDoc = await getDoc(doc(firestore, 'packages', planId))
          if (planDoc.exists()) {
            const planData = planDoc.data()
            // Check if this looks like a Pro plan (has price > 0 and unlimited features)
            if (planData.price > 0 && (planData.task_limit === -1 || planData.habit_limit === -1)) {
              setProPlan(planData)
              return
            }
          }
        } catch (error) {
          console.log(`Plan ${planId} not found, trying next...`)
        }
      }

      // If no specific Pro plan found, try to find any plan with unlimited features
      try {
        const packagesSnapshot = await getDocs(collection(firestore, 'packages'))
        for (const docSnapshot of packagesSnapshot.docs) {
          const planData = docSnapshot.data()
          if (planData.price > 0 && (planData.task_limit === -1 || planData.habit_limit === -1)) {
            setProPlan(planData)
            return
          }
        }
      } catch (error) {
        console.log('Error searching all packages:', error)
      }

      // Fallback to default Pro plan if none found
      setProPlan({
        name: 'Pro Plan',
        price: 7,
        description: 'Unlimited access to all features',
      })
    } catch (error) {
      console.error('Error fetching Pro plan:', error)
      // Fallback to default Pro plan
      setProPlan({
        name: 'Pro Plan',
        price: 7,
        description: 'Unlimited access to all features',
      })
    } finally {
      setLoadingPlan(false)
    }
  }

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
      {loadingPlan ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      ) : (
        <>
          {/* Pro Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Upgrade to {proPlan?.name || 'Pro'}
              </h3>
            </div>

            {proPlan?.description && <p className="text-gray-600 mb-4">{proPlan.description}</p>}

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
            <div className="text-3xl font-bold text-gray-900 mb-1">${proPlan?.price || 7}</div>
            <div className="text-gray-600">per month</div>
            <div className="text-sm text-blue-600 font-medium mt-2">
              Cancel anytime • No commitment
            </div>
          </div>
        </>
      )}
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
              Upgrade to {proPlan?.name || 'Pro'}
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
