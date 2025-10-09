'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import {
  getUserSubscription,
  getCurrentMonthUsage,
  getPlanLimits,
  listenToUserSubscription,
} from '@/lib/subscriptionApi'
import Button from '@/components/Button'
import { BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'

export default function UsageMeter() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
  const [planLimits, setPlanLimits] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!user) return

    // Set up real-time listener for subscription changes
    const unsubscribe = listenToUserSubscription(user.uid, async (userData) => {
      if (userData) {
        setSubscription(userData)

        if (userData.plan === 'free') {
          try {
            const currentUsage = await getCurrentMonthUsage(user.uid)
            const limits = await getPlanLimits(user.uid)

            setUsage(currentUsage)
            setPlanLimits(limits)
            setIsVisible(true)
          } catch (error) {
            console.error('Error loading usage data:', error)
          }
        } else {
          setIsVisible(false)
        }
      } else {
        setSubscription(null)
        setIsVisible(false)
      }
    })

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  if (!isVisible || !subscription || subscription.plan !== 'free' || !usage || !planLimits) {
    return null
  }

  const features = [
    { key: 'tasks', label: 'Tasks', icon: '📝' },
    { key: 'notes', label: 'Notes', icon: '📝' },
    { key: 'habits', label: 'Habits', icon: '🔄' },
    { key: 'sheets', label: 'Agenda', icon: '📊' },
  ]

  const getUsagePercentage = (feature) => {
    const current = usage[feature] || 0
    const limit = planLimits[feature]
    return Math.min((current / limit) * 100, 100)
  }

  const isNearLimit = (feature) => {
    const percentage = getUsagePercentage(feature)
    return percentage >= 80
  }

  const isAtLimit = (feature) => {
    const percentage = getUsagePercentage(feature)
    return percentage >= 100
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Monthly Usage</h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('/billing', '_blank')}
          className="text-xs"
        >
          Upgrade to Pro
        </Button>
      </div>

      <div className="space-y-3">
        {features.map((feature) => {
          const current = usage[feature.key] || 0
          const limit = planLimits[feature.key]
          const percentage = getUsagePercentage(feature.key)
          const isNear = isNearLimit(feature.key)
          const isAt = isAtLimit(feature.key)

          return (
            <div key={feature.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span>{feature.icon}</span>
                  <span className="text-gray-700">{feature.label}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">
                    {current} / {limit}
                  </span>

                  {isAt ? (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  ) : isNear ? (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isAt ? 'bg-red-500' : isNear ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Free plan limits</span>
          <span>Upgrade for unlimited access</span>
        </div>
      </div>
    </div>
  )
}
