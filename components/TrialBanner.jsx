'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getUserSubscription, isInTrial, getTrialDaysRemaining } from '@/lib/subscriptionApi'
import Button from '@/components/Button'
import { Clock, Crown, AlertTriangle } from 'lucide-react'

export default function TrialBanner() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function checkTrialStatus() {
      if (!user) return

      try {
        const userSubscription = await getUserSubscription(user.uid)
        setSubscription(userSubscription)

        if (userSubscription && isInTrial(userSubscription)) {
          const daysRemaining = getTrialDaysRemaining(userSubscription)
          setTrialDaysRemaining(daysRemaining)
          setIsVisible(true)
        }
      } catch (error) {
        console.error('Error checking trial status:', error)
      }
    }

    checkTrialStatus()
  }, [user])

  if (!isVisible || !subscription || !isInTrial(subscription)) {
    return null
  }

  const isTrialEndingSoon = trialDaysRemaining <= 3
  const isTrialEndingToday = trialDaysRemaining === 0

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            {isTrialEndingToday ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : isTrialEndingSoon ? (
              <Clock className="h-5 w-5 text-orange-500" />
            ) : (
              <Crown className="h-5 w-5 text-blue-500" />
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {isTrialEndingToday
                  ? 'Your trial ends today!'
                  : isTrialEndingSoon
                    ? `Trial ending soon - ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} left`
                    : `Free trial - ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} remaining`}
              </span>

              {!isTrialEndingToday && (
                <span className="text-xs text-gray-500">Upgrade to Pro for unlimited access</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/billing', '_blank')}
              className="text-xs"
            >
              {isTrialEndingToday ? 'Upgrade Now' : 'Upgrade to Pro'}
            </Button>

            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
