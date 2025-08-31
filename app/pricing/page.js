'use client'

import Button from '@/components/Button'
import { Check, Star, Zap, Shield, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'
import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      router.push('/billing')
    } else {
      router.push('/login')
    }
  }

  const features = {
    free: [
      '20 tasks per month',
      '5 notes per month',
      '3 habits per month',
      '1 event per day',
      '2 agenda sheets',
      'Basic support',
      'Community access',
    ],
    pro: [
      'Unlimited tasks',
      'Unlimited notes',
      'Unlimited habits',
      'Unlimited events',
      'Unlimited agenda sheets',
      'Advanced insights dashboard',
      'Priority support',
      'Early access to features',
      'Data export',
      'Custom categories',
    ],
  }

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
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h2>
              <p className="text-gray-600 mb-4">Perfect for getting started</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-500">Forever free</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button onClick={handleGetStarted} className="w-full" variant="outline">
              Get Started Free
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-bl-lg font-semibold text-sm">
              <Star className="w-4 h-4 inline mr-1" />
              Most Popular
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
              <p className="text-blue-100 mb-4">For power users and teams</p>
              <div className="text-4xl font-bold mb-2">$7</div>
              <p className="text-blue-200">per month</p>
              <p className="text-sm text-blue-200 mt-1">or $60/year (save $24)</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center text-blue-50">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleGetStarted}
              className="w-full bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Free Trial
            </Button>
          </div>
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
                  <th className="text-center py-4 px-6 text-lg font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 text-lg font-semibold text-blue-600">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium">Tasks</td>
                  <td className="text-center py-4 px-6">20/month</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Notes</td>
                  <td className="text-center py-4 px-6">5/month</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Habits</td>
                  <td className="text-center py-4 px-6">3/month</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Events</td>
                  <td className="text-center py-4 px-6">1/day</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Agenda Sheets</td>
                  <td className="text-center py-4 px-6">2</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Insights Dashboard</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Priority Support</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Data Export</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
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
                Yes! Choose annual billing and save $24 per year compared to monthly billing.
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
