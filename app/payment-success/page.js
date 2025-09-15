'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getUserSubscription } from '@/lib/subscriptionApi'
import AppShell from '@/components/AppShell'
import Button from '@/components/Button'
import { CheckCircle, Crown, ArrowRight, Sparkles } from 'lucide-react'

export default function PaymentSuccessPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSubscription() {
      if (!user) return

      try {
        const userSubscription = await getUserSubscription(user.uid)
        setSubscription(userSubscription)
      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [user])

  const handleContinue = () => {
    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Welcome to Pro! Your account has been upgraded successfully.
          </p>
        </div>

        {/* Pro Plan Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Crown className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Pro Plan Activated</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited tasks</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited notes</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited habits</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited events</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Advanced insights</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900 capitalize">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 capitalize">{subscription.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium text-gray-900">
                  {subscription.subscriptionStartDate
                    ? new Date(subscription.subscriptionStartDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{subscription.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Sparkles className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Explore all features</p>
                <p className="text-sm text-gray-600">
                  Access unlimited tasks, notes, habits, and advanced insights
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Sparkles className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Export your data</p>
                <p className="text-sm text-gray-600">
                  Download your tasks, notes, and habits anytime
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Sparkles className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Get priority support</p>
                <p className="text-sm text-gray-600">Contact our support team for any assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
          >
            <div className="flex items-center justify-center">
              <span>Continue to Dashboard</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = '/billing')}
            className="flex-1"
          >
            Manage Subscription
          </Button>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Thank you for upgrading to Pro! We're excited to help you achieve your goals.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
