'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { PADDLE_CONFIG } from '@/lib/paddleApi'
import AppShell from '@/components/AppShell'
import Button from '@/components/Button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function DebugPaddlePage() {
  const { user } = useAuth()
  const [debugResults, setDebugResults] = useState({})
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const results = {}

    try {
      // 1. Check environment variables (client-side only)
      results.envVars = {
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
        clientId: process.env.NEXT_PUBLIC_PADDLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
        apiKey: '⏭️ Server-side only',
        webhookSecret: '⏭️ Server-side only',
        monthlyProductId: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID ? '✅ Set' : '❌ Missing',
        yearlyProductId: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID ? '✅ Set' : '❌ Missing',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing',
      }

      // 2. Check server-side environment variables
      try {
        const serverResponse = await fetch('/api/debug/env-check')
        const serverData = await serverResponse.json()

        if (serverData.success) {
          results.serverEnvVars = serverData.serverEnvVars
          results.paddleConfig = serverData.paddleConfig
          results.apiTest = serverData.apiTest
        } else {
          results.serverError = serverData.error
        }
      } catch (error) {
        results.serverError = error.message
      }

      // 3. Test checkout session creation
      if (user && results.envVars.monthlyProductId === '✅ Set') {
        try {
          const response = await fetch('/api/paddle/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID,
              customerEmail: user.email,
              customerId: user.uid,
              customData: { test: true },
            }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            results.checkoutTest = {
              status: '✅ Success',
              checkoutUrl: data.checkoutUrl,
              checkoutId: data.checkoutId,
            }
          } else {
            results.checkoutTest = {
              status: '❌ Failed',
              error: data.error,
              details: data.details,
            }
          }
        } catch (error) {
          results.checkoutTest = {
            status: '❌ Error',
            error: error.message,
          }
        }
      } else {
        results.checkoutTest = {
          status: '⏭️ Skipped',
          reason: !user ? 'No user logged in' : 'Missing product ID',
        }
      }

      // 4. Test webhook endpoint
      try {
        const webhookResponse = await fetch('/api/paddle/webhook/test')
        const webhookData = await webhookResponse.json()

        if (webhookResponse.ok) {
          results.webhookTest = {
            status: '✅ Accessible',
            message: webhookData.message,
          }
        } else {
          results.webhookTest = {
            status: '❌ Failed',
            error: webhookData.error,
          }
        }
      } catch (error) {
        results.webhookTest = {
          status: '❌ Error',
          error: error.message,
        }
      }
    } catch (error) {
      results.error = error.message
    }

    setDebugResults(results)
    setLoading(false)
  }

  const getStatusIcon = (status) => {
    if (status.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status.includes('❌')) return <XCircle className="h-4 w-4 text-red-500" />
    if (status.includes('⏭️')) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <AlertCircle className="h-4 w-4 text-gray-500" />
  }

  const getStatusColor = (status) => {
    if (status.includes('✅')) return 'text-green-700 bg-green-50'
    if (status.includes('❌')) return 'text-red-700 bg-red-50'
    if (status.includes('⏭️')) return 'text-yellow-700 bg-yellow-50'
    return 'text-gray-700 bg-gray-50'
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paddle Integration Debug</h1>
          <p className="text-gray-600">Diagnose Paddle payment integration issues</p>
        </div>

        <div className="mb-6">
          <Button
            onClick={runDiagnostics}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Diagnostics...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Run Diagnostics</span>
              </div>
            )}
          </Button>
        </div>

        {Object.keys(debugResults).length > 0 && (
          <div className="space-y-6">
            {/* Client-side Environment Variables */}
            {debugResults.envVars && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Client-side Environment Variables
                </h2>
                <div className="space-y-2">
                  {Object.entries(debugResults.envVars).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(value)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(value)}
                          <span>{value}</span>
                        </div>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server-side Environment Variables */}
            {debugResults.serverEnvVars && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Server-side Environment Variables
                </h2>
                <div className="space-y-2">
                  {Object.entries(debugResults.serverEnvVars).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(value)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(value)}
                          <span>{value}</span>
                        </div>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Connectivity Test */}
            {debugResults.apiTest && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Paddle API Connectivity
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(debugResults.apiTest.status)}`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugResults.apiTest.status)}
                        <span>{debugResults.apiTest.status}</span>
                      </div>
                    </span>
                  </div>

                  {debugResults.apiTest.message && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Message:</span>
                      <span className="text-sm text-gray-600">{debugResults.apiTest.message}</span>
                    </div>
                  )}

                  {debugResults.apiTest.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 font-medium">Error:</p>
                      <p className="text-red-700 text-sm">{debugResults.apiTest.error}</p>
                      {debugResults.apiTest.details && (
                        <pre className="text-xs text-red-600 mt-2 overflow-auto">
                          {JSON.stringify(debugResults.apiTest.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paddle Configuration */}
            {debugResults.paddleConfig && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Paddle Configuration</h2>
                <div className="space-y-2">
                  {Object.entries(debugResults.paddleConfig).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(value)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(value)}
                          <span>{value}</span>
                        </div>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checkout Test */}
            {debugResults.checkoutTest && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Checkout Session Test</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(debugResults.checkoutTest.status)}`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugResults.checkoutTest.status)}
                        <span>{debugResults.checkoutTest.status}</span>
                      </div>
                    </span>
                  </div>

                  {debugResults.checkoutTest.checkoutUrl && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Checkout URL:</span>
                      <span className="text-sm text-blue-600 font-mono">
                        {debugResults.checkoutTest.checkoutUrl.substring(0, 50)}...
                      </span>
                    </div>
                  )}

                  {debugResults.checkoutTest.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 font-medium">Error:</p>
                      <p className="text-red-700 text-sm">{debugResults.checkoutTest.error}</p>
                      {debugResults.checkoutTest.details && (
                        <pre className="text-xs text-red-600 mt-2 overflow-auto">
                          {JSON.stringify(debugResults.checkoutTest.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Webhook Test */}
            {debugResults.webhookTest && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Webhook Endpoint Test</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(debugResults.webhookTest.status)}`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugResults.webhookTest.status)}
                        <span>{debugResults.webhookTest.status}</span>
                      </div>
                    </span>
                  </div>

                  {debugResults.webhookTest.message && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Message:</span>
                      <span className="text-sm text-gray-600">
                        {debugResults.webhookTest.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Issues & Solutions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Common Issues & Solutions
              </h3>
              <div className="space-y-3 text-blue-800">
                <div>
                  <strong>❌ Missing Environment Variables:</strong>
                  <p className="text-sm mt-1">
                    Make sure all required environment variables are set in your .env.local file
                  </p>
                </div>
                <div>
                  <strong>❌ Checkout Session Failed:</strong>
                  <p className="text-sm mt-1">
                    Check your Paddle API key and product IDs. Make sure you're using sandbox
                    credentials for testing.
                  </p>
                </div>
                <div>
                  <strong>❌ Subscription in App but not Paddle:</strong>
                  <p className="text-sm mt-1">
                    This means the checkout flow isn't working. Check the checkout session creation
                    and make sure you're being redirected to Paddle.
                  </p>
                </div>
                <div>
                  <strong>✅ All Tests Pass but Still Issues:</strong>
                  <p className="text-sm mt-1">
                    Check browser console for JavaScript errors and server logs for API errors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
