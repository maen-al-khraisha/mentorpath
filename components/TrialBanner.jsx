'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getUserSubscription } from '@/lib/subscriptionApi'
import Button from '@/components/Button'
import { Crown, AlertTriangle } from 'lucide-react'

export default function PlanBanner() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function checkPlanStatus() {
      if (!user) return

      try {
        const userSubscription = await getUserSubscription(user.uid)
        setSubscription(userSubscription)

        // Show banner for free plan users
        if (userSubscription && userSubscription.plan === 'free') {
          setIsVisible(true)
        }
      } catch (error) {
        console.error('Error checking plan status:', error)
      }
    }

    checkPlanStatus()
  }, [user])

  const handleUpgrade = () => {
    window.location.href = '/mock-payment'
  }

  if (!isVisible || !subscription) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">You're on the Free Plan</span>
              <span className="text-xs text-gray-500">
                Upgrade to Pro for unlimited access to all features
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleUpgrade} className="text-xs">
              <Crown className="h-4 w-4 mr-1" />
              Upgrade to Pro
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
