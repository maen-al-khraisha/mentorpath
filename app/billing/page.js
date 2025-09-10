'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getUserSubscription, updateUserPlan } from '@/lib/subscriptionApi'
import { createCheckoutSession, initializePaddle, PADDLE_CONFIG, getPaddle } from '@/lib/paddleApi'
import { handlePaymentError } from '@/lib/paymentErrors'
import AppShell from '@/components/AppShell'
import Button from '@/components/Button'
import { Check, Crown, Star, Zap } from 'lucide-react'

export default function BillingPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

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

    // Initialize Paddle on component mount
    if (typeof window !== 'undefined') {
      initializePaddle()
    }

    // Handle checkout success/cancel from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const checkoutStatus = urlParams.get('checkout')

    if (checkoutStatus === 'success') {
      // Reload subscription data after successful checkout
      loadSubscription()
      // Show success message
      alert('Payment successful! Welcome to Pro!')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (checkoutStatus === 'cancelled') {
      // Show cancellation message
      alert('Payment was cancelled. You can try again anytime.')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      loadSubscription()
    }
  }, [user])

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      productId: null,
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
      productId: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID,
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

  const handleUpgrade = async (planId) => {
    if (!user) return

    setUpgrading(true)
    try {
      if (planId === 'pro') {
        // Initialize Paddle if not already done
        initializePaddle()

        // Get the appropriate product ID based on billing period
        const productId =
          plans.find((p) => p.id === planId)?.productId ||
          process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID

        // Debug logging
        console.log('🔍 Debug Info:', {
          planId,
          productId,
          userEmail: user.email,
          userId: user.uid,
          environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
        })

        if (!productId) {
          throw new Error('Product ID is missing. Please check your environment variables.')
        }

        // Use Paddle JS SDK with redirect mode to avoid CSP issues
        const paddle = getPaddle()

        if (!paddle) {
          throw new Error('Paddle SDK not initialized. Please check your Paddle client ID.')
        }

        console.log('🚀 Creating Paddle checkout with redirect mode...')

        // Create checkout using Paddle SDK with redirect mode
        paddle.Checkout.open({
          items: [
            {
              priceId: productId,
              quantity: 1,
            },
          ],
          customer: {
            email: user.email,
            customData: {
              user_id: user.uid,
              plan: planId,
            },
          },
          customData: {
            user_id: user.uid,
            plan: planId,
          },
          settings: {
            displayMode: 'redirect',
            theme: 'light',
            locale: 'en',
            allowLogout: false,
          },
          eventCallback: (data) => {
            console.log('🔍 Paddle checkout event:', data)

            if (data.name === 'checkout.completed') {
              console.log('✅ Checkout completed!')
              // Reload the page to show updated subscription
              window.location.reload()
            } else if (data.name === 'checkout.error') {
              console.error('❌ Checkout error:', data)
              alert('Payment failed. Please try again.')
            }
          },
        })
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      const errorInfo = handlePaymentError(error)
      alert(`Error upgrading: ${errorInfo.userMessage}`)
    } finally {
      setUpgrading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          <p className="text-gray-600 mb-4">
            {subscription?.plan === 'pro'
              ? 'You are currently on the Pro plan. Manage your subscription below.'
              : 'Upgrade to unlock unlimited features and advanced insights.'}
          </p>
          <a href="/pricing" className="text-blue-600 hover:text-blue-800 underline text-sm">
            View detailed pricing information →
          </a>
        </div>

        {subscription?.plan === 'pro' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Pro Plan Active</span>
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
                }`}
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
                    <div className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium">
                      Current Plan
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                      className={`w-full ${
                        isPro ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {upgrading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {isPro && <Crown className="h-4 w-4" />}
                          <span>Upgrade to {plan.name}</span>
                        </div>
                      )}
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
