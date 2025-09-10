'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getUserSubscription } from '@/lib/subscriptionApi'
import AppShell from '@/components/AppShell'
import Button from '@/components/Button'
import { RefreshCw, Trash2, User } from 'lucide-react'

export default function TestSubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)
  const [proUsers, setProUsers] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSubscription()
    loadProUsers()
  }, [user])

  const loadSubscription = async () => {
    if (!user) return

    try {
      const userSubscription = await getUserSubscription(user.uid)
      setSubscription(userSubscription)
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const loadProUsers = async () => {
    try {
      const response = await fetch('/api/test/reset-subscription')
      const data = await response.json()
      if (data.success) {
        setProUsers(data.proUsers)
      }
    } catch (error) {
      console.error('Error loading pro users:', error)
    }
  }

  const resetMySubscription = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/test/reset-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Subscription reset to free plan successfully!')
        await loadSubscription()
        await loadProUsers()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetUserSubscription = async (userId) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/test/reset-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ User ${userId} subscription reset successfully!`)
        await loadProUsers()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Please log in to access this page</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Testing</h1>
          <p className="text-gray-600">Manage subscriptions for testing purposes</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Current User Subscription */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Current Subscription</h2>

          {subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Plan:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    subscription.plan === 'pro'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscription.plan.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {subscription.status}
                </span>
              </div>

              {subscription.paddleSubscriptionId && (
                <div className="flex justify-between">
                  <span className="font-medium">Paddle Subscription ID:</span>
                  <span className="text-sm text-gray-600 font-mono">
                    {subscription.paddleSubscriptionId}
                  </span>
                </div>
              )}

              {subscription.paddleCustomerId && (
                <div className="flex justify-between">
                  <span className="font-medium">Paddle Customer ID:</span>
                  <span className="text-sm text-gray-600 font-mono">
                    {subscription.paddleCustomerId}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No subscription data found</p>
          )}

          <div className="mt-6">
            <Button
              onClick={resetMySubscription}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Resetting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Reset My Subscription to Free</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* All Pro Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Pro Users ({proUsers.length})
          </h2>

          {proUsers.length > 0 ? (
            <div className="space-y-3">
              {proUsers.map((proUser) => (
                <div
                  key={proUser.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {proUser.email || proUser.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 font-mono">ID: {proUser.id}</p>
                      {proUser.paddleSubscriptionId && (
                        <p className="text-xs text-gray-400 font-mono">
                          Paddle: {proUser.paddleSubscriptionId}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => resetUserSubscription(proUser.id)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No Pro users found</p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Use this page to reset subscriptions back to free plan for testing</li>
            <li>• After resetting, you can test the upgrade flow again</li>
            <li>• Use Paddle test cards: 4000 0000 0000 0002 (success)</li>
            <li>• Check webhook events in your terminal/console</li>
            <li>• This page is only for development/testing purposes</li>
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
