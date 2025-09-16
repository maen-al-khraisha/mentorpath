'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/Button'
import { Check, Star, Zap, Shield, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'
import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'
import { firestore } from '@/lib/firebaseClient'
import { collection, getDocs } from 'firebase/firestore'

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const packagesSnapshot = await getDocs(collection(firestore, 'packages'))
        const packagesData = packagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPackages(packagesData)
      } catch (error) {
        console.error('Error loading packages:', error)
        // Set empty packages array if database fails
        setPackages([])
      } finally {
        setLoading(false)
      }
    }

    loadPackages()
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push('/billing')
    } else {
      router.push('/login')
    }
  }

  const formatLimit = (limit) => {
    if (limit === -1) return 'Unlimited'
    if (limit === undefined || limit === null) return '0'
    return limit.toString()
  }

  const getFeatures = (pkg) => {
    const features = []

    // Add limit-based features
    const taskLimit = pkg.task_limit ?? 0
    const notesLimit = pkg.notes_limit ?? 0
    const habitLimit = pkg.habit_limit ?? 0
    const eventsLimit = pkg.events_limit ?? 0
    const sheetLimit = pkg.sheet_limit ?? 0

    if (taskLimit === -1) {
      features.push('Unlimited tasks')
    } else {
      features.push(`${taskLimit} tasks per month`)
    }

    if (notesLimit === -1) {
      features.push('Unlimited notes')
    } else {
      features.push(`${notesLimit} notes per month`)
    }

    if (habitLimit === -1) {
      features.push('Unlimited habits')
    } else {
      features.push(`${habitLimit} habits per month`)
    }

    if (eventsLimit === -1) {
      features.push('Unlimited events')
    } else {
      features.push(`${eventsLimit} event per day`)
    }

    if (sheetLimit === -1) {
      features.push('Unlimited agenda sheets')
    } else {
      features.push(`${sheetLimit} agenda sheets`)
    }

    // Add plan-specific features
    if (pkg.id === 'free-plan') {
      features.push('Basic support')
      features.push('Community access')
    } else if (pkg.id === 'pro-plan') {
      features.push('Advanced insights dashboard')
      features.push('Priority support')
      features.push('Early access to features')
      features.push('Data export')
      features.push('Custom categories')
    }

    return features
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <MainHeader />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pricing information...</p>
            </div>
          </div>
        </main>
        <FooterLegal />
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <MainHeader />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Packages Available</h1>
              <p className="text-gray-600 mb-8">Please contact support or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <FooterLegal />
      </div>
    )
  }

  // Sort packages: Free first, then by price
  const sortedPackages = packages.sort((a, b) => {
    if (a.id === 'free-plan') return -1
    if (b.id === 'free-plan') return 1
    return a.price - b.price
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MainHeader />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a free trial and upgrade when you're ready. No hidden fees, no surprises -
            just straightforward pricing for your productivity needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid gap-8 max-w-5xl mx-auto mb-16 ${packages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
        >
          {sortedPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`bg-white border-2 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative ${
                pkg.id === 'pro-plan'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge for Pro Plan */}
              {pkg.id === 'pro-plan' && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-bl-lg font-semibold text-sm">
                  <Star className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    pkg.id === 'pro-plan' ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                >
                  {pkg.id === 'pro-plan' ? (
                    <Zap
                      className={`w-8 h-8 ${pkg.id === 'pro-plan' ? 'text-white' : 'text-gray-600'}`}
                    />
                  ) : (
                    <Shield
                      className={`w-8 h-8 ${pkg.id === 'pro-plan' ? 'text-white' : 'text-gray-600'}`}
                    />
                  )}
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${pkg.id === 'pro-plan' ? 'text-white' : 'text-gray-900'}`}
                >
                  {pkg.name}
                </h2>
                <p className={`mb-4 ${pkg.id === 'pro-plan' ? 'text-blue-100' : 'text-gray-600'}`}>
                  {pkg.description}
                </p>
                <div
                  className={`text-4xl font-bold mb-2 ${pkg.id === 'pro-plan' ? 'text-white' : 'text-gray-900'}`}
                >
                  ${pkg.price}
                </div>
                <p className={pkg.id === 'pro-plan' ? 'text-blue-200' : 'text-gray-500'}>
                  {pkg.price === 0 ? 'Forever free' : 'per month'}
                </p>
                {pkg.id === 'pro-plan' && (
                  <p className="text-sm text-blue-200 mt-1">or $60/year (save $24)</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {getFeatures(pkg).map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className={`flex items-center ${
                      pkg.id === 'pro-plan' ? 'text-blue-50' : 'text-gray-700'
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        pkg.id === 'pro-plan' ? 'text-green-400' : 'text-green-500'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleGetStarted}
                className={`w-full ${
                  pkg.id === 'pro-plan' ? 'bg-white text-blue-600 hover:bg-gray-100' : ''
                }`}
                variant={pkg.id === 'pro-plan' ? 'primary' : 'outline'}
              >
                {pkg.id === 'pro-plan' ? 'Start Free Trial' : 'Get Started Free'}
              </Button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-lg font-semibold text-gray-900">
                    Feature
                  </th>
                  {sortedPackages.map((pkg) => (
                    <th
                      key={pkg.id}
                      className={`text-center py-4 px-6 text-lg font-semibold ${
                        pkg.id === 'pro-plan' ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium">Tasks</td>
                  {sortedPackages.map((pkg) => (
                    <td
                      key={pkg.id}
                      className={`text-center py-4 px-6 ${
                        pkg.id === 'pro-plan' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      {formatLimit(pkg.task_limit)}
                      {(pkg.task_limit ?? 0) !== -1 ? '/month' : ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Notes</td>
                  {sortedPackages.map((pkg) => (
                    <td
                      key={pkg.id}
                      className={`text-center py-4 px-6 ${
                        pkg.id === 'pro-plan' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      {formatLimit(pkg.notes_limit)}
                      {(pkg.notes_limit ?? 0) !== -1 ? '/month' : ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Habits</td>
                  {sortedPackages.map((pkg) => (
                    <td
                      key={pkg.id}
                      className={`text-center py-4 px-6 ${
                        pkg.id === 'pro-plan' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      {formatLimit(pkg.habit_limit)}
                      {(pkg.habit_limit ?? 0) !== -1 ? '/month' : ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Events</td>
                  {sortedPackages.map((pkg) => (
                    <td
                      key={pkg.id}
                      className={`text-center py-4 px-6 ${
                        pkg.id === 'pro-plan' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      {formatLimit(pkg.events_limit)}
                      {(pkg.events_limit ?? 0) !== -1 ? '/day' : ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Agenda Sheets</td>
                  {sortedPackages.map((pkg) => (
                    <td
                      key={pkg.id}
                      className={`text-center py-4 px-6 ${
                        pkg.id === 'pro-plan' ? 'text-blue-600 font-semibold' : ''
                      }`}
                    >
                      {formatLimit(pkg.sheet_limit)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Insights Dashboard</td>
                  {sortedPackages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-4 px-6">
                      {pkg.insights_enabled ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Priority Support</td>
                  {sortedPackages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-4 px-6">
                      {pkg.id === 'pro-plan' ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Data Export</td>
                  {sortedPackages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-4 px-6">
                      {pkg.id === 'pro-plan' ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the free trial work?
              </h3>
              <p className="text-gray-700">
                New users get a 14-day free trial with full Pro access. No credit card required. You
                can cancel anytime during the trial period.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-700">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have Pro
                access until the end of your current billing period.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed free plan limits?
              </h3>
              <p className="text-gray-700">
                You'll see a friendly upgrade prompt when you reach your limits. Upgrade to Pro for
                unlimited access to all features.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a yearly discount?
              </h3>
              <p className="text-gray-700">
                Yes! Choose annual billing and save $24 per year compared to monthly billing on our
                Pro plan.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their daily workflow with MentorPath Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/features')}
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            By subscribing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . All prices exclude applicable taxes.
          </p>
        </div>
      </main>

      <FooterLegal />
    </div>
  )
}
