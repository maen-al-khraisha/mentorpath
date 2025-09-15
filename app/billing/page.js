'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getUserSubscription } from '@/lib/subscriptionApi'
import AppShell from '@/components/AppShell'
import Button from '@/components/Button'
import { Check, Crown, Star, Zap } from 'lucide-react'

export default function BillingPage() {
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

  const handleUpgrade = async (planId) => {
    if (!user) return

    if (planId === 'pro') {
      // Redirect to mock payment page
      window.location.href = '/mock-payment'
    }
  }

  const handleDowngrade = async () => {
    if (!user) return

    const confirmed = window.confirm(
      'Are you sure you want to downgrade to the Free plan? You will lose access to unlimited features and advanced insights.'
    )

    if (confirmed) {
      try {
        const { downgradeToFree } = await import('@/lib/subscriptionApi')
        await downgradeToFree(user.uid)

        // Refresh subscription data
        const userSubscription = await getUserSubscription(user.uid)
        setSubscription(userSubscription)

        alert('Successfully downgraded to Free plan!')
      } catch (error) {
        console.error('Downgrade failed:', error)
        alert('Failed to downgrade. Please try again.')
      }
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '20 tasks per month',
        '5 notes per month',
        '3 habits per month',
        '1 event per day',
        '2 agenda sheets',
        'Basic support',
      ],
      limitations: ['No insights dashboard', 'Limited features'],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$7',
      period: 'per month',
      features: [
        'Unlimited tasks',
        'Unlimited notes',
        'Unlimited habits',
        'Unlimited events',
        'Unlimited agenda sheets',
        'Advanced insights dashboard',
        'Priority support',
        'Export data',
        'Custom themes',
      ],
      limitations: [],
      popular: true,
      savings: 'Save $24/year with annual billing',
    },
  ]

  const getCurrentPlan = () => {
    if (!subscription) return null
    return plans.find((plan) => plan.id === subscription.plan) || plans[0]
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading billing information...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Current Plan</h1>
          <p className="text-gray-600 mb-4">
            {subscription?.plan === 'pro'
              ? 'You are currently on the Pro plan with unlimited access to all features.'
              : 'You are currently on the Free plan. Contact support to upgrade.'}
          </p>
        </div>

        {subscription?.plan === 'pro' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Pro Plan Active</span>
              </div>
              <Button
                variant="outline"
                onClick={handleDowngrade}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Downgrade to Free
              </Button>
            </div>
            <p className="text-green-700 text-sm mt-1">
              You have unlimited access to all features. Thank you for being a Pro user!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id
            const isPro = plan.id === 'pro'

            return (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-sm text-blue-600 font-medium">{plan.savings}</p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      {plan.limitations.map((limitation, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-gray-500"
                        >
                          <span className="text-red-500">×</span>
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {isCurrentPlan ? (
                    <div className="bg-green-100 text-green-700 py-2 px-4 rounded-md text-sm font-medium">
                      ✓ Current Plan
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Have questions about our plans or need assistance with your subscription?
            </p>
            <Button variant="outline" onClick={() => window.open('mailto:support@mentorpath.com')}>
              Contact Support
            </Button>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 text-center">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="/terms"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </a>
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <a
                href="/refund"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Refund Policy
              </a>
              <a
                href="/subscription-terms"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscription Terms
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              By subscribing, you agree to our Terms & Conditions and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
